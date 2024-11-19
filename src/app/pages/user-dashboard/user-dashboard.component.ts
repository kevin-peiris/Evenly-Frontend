import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { GroupService } from '../../services/group.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [NgFor, FormsModule, CommonModule, NgbModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  user: any = null;
  groupList: any[] = [];
  userList: any[] = [];
  expensesList: any[] = [];

  group = {
    name: '',
    admin: null,
    members: [] as any[]
  };
  selectedUserId: number | null = null;

  totalBalance = 0;
  youOwe = 0;
  youAreOwed = 0;

  constructor(
    private userService: UserService,
    private groupService: GroupService,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userService.currentUser.subscribe(user => {
      this.user = user;

      if (this.user && this.user.id) {
        this.group.admin = this.user;
        this.loadGroupsAndUsers();
      }
    });
  }

  async loadGroupsAndUsers() {
    try {
      const groupsResponse = await fetch(`http://localhost:8080/group/member/${this.user.id}`);
      this.groupList = await groupsResponse.json();
    } catch (error) {
      console.error("Error fetching groups:", error);
      this.groupList = [];
    }

    try {
      const usersResponse = await fetch(`http://localhost:8080/users`);
      const users = await usersResponse.json();
      this.userList = users.filter((user: any) => user.id !== this.user.id);
    } catch (error) {
      console.error("Error fetching users:", error);
      this.userList = [];
    }

    this.calculateBalances();
  }

  addMember() {
    const selectedUser = this.userList.find(user => user.id == this.selectedUserId);
    if (selectedUser && !this.group.members.some(member => member.id == selectedUser.id)) {
      this.group.members.push(selectedUser);
      this.selectedUserId = null;
    }
  }

  removeMember(member: any) {
    this.group.members = this.group.members.filter(m => m.id !== member.id);
  }

  async createGroup() {
    if (this.group.name && this.group.admin && this.group.members.length > 0) {
      try {
        await this.http.post("http://localhost:8080/group", this.group, { responseType: 'text' }).toPromise();
        this.group = { name: '', admin: null, members: [] };
        await this.loadGroupsAndUsers();
      } catch (error) {
        console.error("Error creating group:", error);
      }
    } else {
      alert("Please fill in all group details.");
    }
  }

  async goToGroup(groupId: number) {
    try {
      const groupResponse = await fetch(`http://localhost:8080/group/${groupId}`);
      const groupData = await groupResponse.json();
      this.groupService.setGroup(groupData);
      this.router.navigate(['/user-main/user-group']);
    } catch (error) {
      console.error("Error navigating to group:", error);
      alert("Error routing");
    }
  }

  async calculateBalances() {
    this.totalBalance = 0;
    this.youOwe = 0;
    this.youAreOwed = 0;
    this.expensesList = [];

    const allExpensesPromises = this.groupList.map(async (group) => {
      try {
        const response = await fetch(`http://localhost:8080/expense/group/${group.id}`);
        const expenses = await response.json();
        return expenses;
      } catch (error) {
        console.error(`Error fetching expenses for group ${group.id}:`, error);
        return [];
      }
    });

    const allExpensesLists = await Promise.all(allExpensesPromises);
    this.expensesList = allExpensesLists.flat();

    this.expensesList.forEach((expense: { expenseUsers: any[] }) => {
      const currentUserRole = expense.expenseUsers.find((user: any) => user.user.id === this.user?.id);

      if (currentUserRole) {
        if (currentUserRole.expenseUserType === 'OWED') {
          this.youOwe += currentUserRole.amount;
          this.totalBalance -= currentUserRole.amount;
        } else if (currentUserRole.expenseUserType === 'PAID') {
          let amountOwedToCurrentUser = 0;
          expense.expenseUsers.forEach((user: any) => {
            if (user.user.id !== this.user?.id && user.expenseUserType === 'OWED') {
              amountOwedToCurrentUser += user.amount;
            }
          });
          this.youAreOwed += amountOwedToCurrentUser;
          this.totalBalance += amountOwedToCurrentUser;
        }
      }
    });

    this.calculateMemberBalances();
  }

  youOweList: { member: any; amount: number }[] = [];
  youAreOwedList: { member: any; amount: number }[] = [];

  calculateMemberBalances() {
    this.youOweList = [];
    this.youAreOwedList = [];

    this.userList.forEach(member => {
      let balance = 0;

      this.expensesList.forEach(expense => {
        const currentUserRole = expense.expenseUsers.find((user: { user: { id: any } }) => user.user.id === this.user.id);
        const memberRole = expense.expenseUsers.find((user: { user: { id: any } }) => user.user.id === member.id);

        if (currentUserRole && memberRole) {
          if (currentUserRole.expenseUserType === 'PAID' && memberRole.expenseUserType === 'OWED') {
            balance += memberRole.amount;
          } else if (currentUserRole.expenseUserType === 'OWED' && memberRole.expenseUserType === 'PAID') {
            balance -= currentUserRole.amount;
          }
        }
      });

      if (balance > 0) {
        this.youAreOwedList.push({ member, amount: balance });
      } else if (balance < 0) {
        this.youOweList.push({ member, amount: Math.abs(balance) });
      }
    });
  }

  getExpensesByGroup(groupId: number) {
    return this.expensesList.filter(expense => expense.groupId === groupId);
  }

  getUserRole(expense: any): { role: 'PAID' | 'OWED', amount: number } | null {

    const currentUserExpense = expense.expenseUsers.find((expUser: any) => expUser.user.id === this.user.id);


    if (currentUserExpense) {
      const role = currentUserExpense.expenseUserType === 'PAID' ? 'PAID' : 'OWED';
      const amount = currentUserExpense.amount;
      return { role, amount };
    }

    return null;
  }

  selectedExpense: any;


  openExpenseDetail(expense: any) {
    this.selectedExpense = expense;
  }


  getPayerNames(expense: any): string {
    // Check if expense is defined
    if (!expense || !expense.expenseUsers) {
      return 'No data available';
    }


    return expense.expenseUsers
      .filter((user: any) => user.expenseUserType === 'PAID')
      .map((user: any) => user.user.name)
      .join(', ');
  }



  async settleUp(expense: any) {
    console.log('Settling up expense:', expense);

    try {

      const response = await fetch(`http://localhost:8080/settleup/expense/${expense.id}/user/${this.user.id}`, {
        method: 'POST',
      });


      if (response.ok) {
        alert("Expense settled successfully!");
      } else {
        alert("Failed to settle the expense. Please try again.");
      }
    } catch (error) {
      console.error("Error settling the expense:", error);
      alert("Error settling the expense. Please check your connection.");
    }


    await this.loadGroupsAndUsers();
  }
  
}



