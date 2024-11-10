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
  user: any = null;  // Store user data
  groupList: any[] = [];  // List of groups the user belongs to
  userList: any[] = [];  // List of other users
  expensesList: any[] = [];

  group = {
    name: '',
    admin: null,
    members: [] as any[]
  };  // Current group details
  selectedUserId: number | null = null;

  totalBalance = 0;  // User's total balance
  youOwe = 0;  // Total amount the user owes
  youAreOwed = 0;  // Total amount owed to the user

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
        this.loadGroupsAndUsers();  // Load groups and user data upon initialization
      }
    });
  }

  async loadGroupsAndUsers() {
    try {
      // Fetch groups related to the current user
      const groupsResponse = await fetch(`http://localhost:8080/group/member/${this.user.id}`);
      this.groupList = await groupsResponse.json();
    } catch (error) {
      console.error("Error fetching groups:", error);
      this.groupList = [];
    }

    try {
      // Fetch all users and filter out the current user from the list
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
      this.selectedUserId = null;  // Reset the selection after adding
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

    // Step 1: Collect all expense data for each group
    const allExpensesPromises = this.groupList.map(async (group) => {
      try {
        const response = await fetch(`http://localhost:8080/expense/group/${group.id}`);
        const expenses = await response.json();
        return expenses;  // Return expenses for this group
      } catch (error) {
        console.error(`Error fetching expenses for group ${group.id}:`, error);
        return [];  // Return empty array if there's an error
      }
    });

    // Wait for all expenses to be fetched
    const allExpensesLists = await Promise.all(allExpensesPromises);

    // Flatten the array of expense lists into a single list of expenses
    this.expensesList = allExpensesLists.flat();

    // Step 2: Process each expense in the consolidated expenses list
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

  // Variables to store calculated balance information
  youOweList: { member: any; amount: number }[] = [];
  youAreOwedList: { member: any; amount: number }[] = [];

  calculateMemberBalances() {
    this.youOweList = [];
    this.youAreOwedList = [];

    this.userList.forEach(member => {
      let balance = 0;

      // Calculate balance between the current user and each member
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

      // Sort the results into either "You owe" or "You are owed" lists
      if (balance > 0) {
        this.youAreOwedList.push({ member, amount: balance });
      } else if (balance < 0) {
        this.youOweList.push({ member, amount: Math.abs(balance) });
      }
    });
  }

}
