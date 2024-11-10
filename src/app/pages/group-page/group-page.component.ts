import { Component, OnInit } from '@angular/core';
import { NavBarUserComponent } from '../../common/nav-bar-user/nav-bar-user.component';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { GroupService } from '../../services/group.service';
import bootstrap from 'bootstrap';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../services/user.service';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { log } from 'node:console';

@Component({
  selector: 'app-group-page',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, NgFor],
  templateUrl: './group-page.component.html',
  styleUrl: './group-page.component.css'
})
export class GroupPageComponent implements OnInit {
  group: any;
  user: any;
  groupList: any[] = [];
  memberList: any[] = [];
  userList: any[] = [];
  expensesList: any[] = [];

  newExpense = {
    description: '',
    amount: 0,
    paidBy: [] as any[],
    owedBy: [] as any[],
    groupId: 0,
    splitType: 'EQUAL'
  };


  totalBalance = 0;
  youOwe = 0;
  youAreOwed = 0;

  constructor(private groupService: GroupService, private userService: UserService, private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.groupService.currentGroup.subscribe(group => {
      this.group = group;
      this.memberList = this.group.members;
    });

    this.userService.currentUser.subscribe(user => {
      this.user = user;
      this.newExpense.paidBy.push(user);
      this.newExpense.owedBy.push(user);
      this.loadGroupsUsersExpenses();
    });
  }



  async loadGroupsUsersExpenses() {
    try {
      const groupsResponse = await fetch(`http://localhost:8080/group/member/${this.user.id}`);
      this.groupList = await groupsResponse.json();
    } catch (error) {
      this.groupList = [];
    }

    try {
      const usersResponse = await fetch(`http://localhost:8080/users`);
      const users = await usersResponse.json();
      // Filter out the current user from the user list
      this.userList = users.filter((user: any) => user.id !== this.user.id);
    } catch (error) {
      this.userList = [];
    }

    try {
      const expensesResponse = await fetch(`http://localhost:8080/expense/group/${this.group.id}`);
      this.expensesList = await expensesResponse.json();
    } catch (error) {
      this.expensesList = [];
    }

    this.calculateBalances();
  }

  calculateBalances() {
    // Reset balances
    this.totalBalance = 0;
    this.youOwe = 0;
    this.youAreOwed = 0;

    // Iterate through each expense to calculate the user's balances
    this.expensesList.forEach(expense => {
      // Find the current user's role in this expense
      const currentUserRole = expense.expenseUsers.find((user: { user: any; userId: number }) => user.user.id === this.user.id);

      if (currentUserRole) {
        if (currentUserRole.expenseUserType === 'OWED') {
          // Current user owes this amount
          this.youOwe += currentUserRole.amount;
          this.totalBalance -= currentUserRole.amount;

        } else if (currentUserRole.expenseUserType === 'PAID') {
          // Current user paid the full expense amount; calculate only the amount others owe back to them

          // Sum amounts owed by other users in this expense
          let amountOwedToCurrentUser = 0;
          expense.expenseUsers.forEach((user: { user: any; expenseUserType: string; amount: number }) => {
            if (user.user.id !== this.user.id && user.expenseUserType === 'OWED') {
              // Add the amount this user owes to the current user
              amountOwedToCurrentUser += user.amount;
            }
          });

          // Only add the amount owed by others to 'youAreOwed' and 'totalBalance'
          this.youAreOwed += amountOwedToCurrentUser;
          this.totalBalance += amountOwedToCurrentUser;
        }
      }
    });
  }



  getMemberBalance(member: any): string {
    let balance = 0;

    // Iterate over all expenses
    this.expensesList.forEach(expense => {
      // Find roles of the current user and the specified member in this expense
      const currentUserRole = expense.expenseUsers.find((user: { user: { id: any }; }) => user.user.id === this.user.id);
      const memberRole = expense.expenseUsers.find((user: { user: { id: any }; }) => user.user.id === member.id);

      // Proceed if both the current user and the specified member are involved in this expense
      if (currentUserRole && memberRole) {
        if (currentUserRole.expenseUserType === 'PAID' && memberRole.expenseUserType === 'OWED') {
          // If the current user paid, add the amount that the member owes to the current user
          balance += memberRole.amount;
        } else if (currentUserRole.expenseUserType === 'OWED' && memberRole.expenseUserType === 'PAID') {
          // If the member paid, subtract the amount that the current user owes to the member
          balance -= currentUserRole.amount;
        }
      }
    });

    // Format the balance result based on the calculated amount
    if (balance > 0) {
      return `Owes you $${balance}`;
    } else if (balance < 0) {
      return `You owe $${Math.abs(balance)}`;
    } else {
      return `Settled up`;
    }
  }

  







  async goToGroup(groupId: number) {
    try {
      const groupResponse = await fetch(`http://localhost:8080/group/${groupId}`);
      this.groupService.setGroup(await groupResponse.json());
    } catch (error) {
      alert("Error routing");
      return; // Exit early if there's an error
    }
    this.loadGroupsUsersExpenses();
    this.router.navigate(['/user-main/user-group']);
  }

  selectedUserId: number | null = null;

  addMember() {
    if (this.user.id !== this.group.admin.id) {
      alert("Only the admin can add members to this group.");
      return;
    }

    const selectedUser = this.userList.find(user => Number(user.id) === Number(this.selectedUserId));

    if (selectedUser && !this.group.members.some((member: { id: any; }) => member.id === selectedUser.id)) {

      this.group.members.push(selectedUser);
      this.selectedUserId = null;
      this.updateGroup();
    }
  }

  removeMember(member: any) {

    if (this.user.id !== this.group.admin.id) {
      alert("Only the admin can remove members from this group.");
      return;
    } else if (member.id == this.group.admin.id) {
      alert("Admin cannot remove himself from this group he has to delete it.");
      return;
    }

    this.group.members = this.group.members.filter((m: { id: any; }) => m.id !== member.id);
    this.updateGroup();
  }

  async updateGroup() {
    try {
      const data = await lastValueFrom(this.http.put("http://localhost:8080/group", this.group, { responseType: 'text' }));
      console.log('Group updated successfully:', data);
      this.loadGroupsUsersExpenses();
    } catch (error) {
      console.error('Error updating group:', error);
    }
  }

  getUserRole(expense: any): { role: 'PAID' | 'OWED', amount: number } | null {
    // Find the entry for the current user in the expense's users list
    const currentUserExpense = expense.expenseUsers.find((expUser: any) => expUser.user.id === this.user.id);

    // Determine the role and return the amount if found
    if (currentUserExpense) {
      const role = currentUserExpense.expenseUserType === 'PAID' ? 'PAID' : 'OWED';
      const amount = currentUserExpense.amount;
      return { role, amount };
    }

    return null; // Return null if the user has no role in this expense
  }

  selectedExpense: any; // Hold the selected expense data

  // Method to open the expense details modal and set selected expense
  openExpenseDetail(expense: any) {
    this.selectedExpense = expense;
  }

  // Method to retrieve names of those who paid
  getPayerNames(expense: any): string {
    // Check if expense is defined
    if (!expense || !expense.expenseUsers) {
      return 'No data available';
    }

    // Retrieve names of those who paid
    return expense.expenseUsers
      .filter((user: any) => user.expenseUserType === 'PAID')
      .map((user: any) => user.user.name)
      .join(', ');
  }


  // Method to handle "Settle Up" action
  async settleUp(expense: any) {
    console.log('Settling up expense:', expense);
  
    try {
      // Sending a request to the server to settle the expense for the current user
      const response = await fetch(`http://localhost:8080/settleup/expense/${expense.id}/user/${this.user.id}`, {
        method: 'POST',
      });
  
      // Check if the response was successful
      if (response.ok) {
        alert("Expense settled successfully!");
      } else {
        alert("Failed to settle the expense. Please try again.");
      }
    } catch (error) {
      console.error("Error settling the expense:", error);
      alert("Error settling the expense. Please check your connection.");
    }
  
    // Reload groups, users, and expenses to reflect the settled expense
    await this.loadGroupsUsersExpenses();
  }
  









  async addExpense() {
    // Ensure the group and the expense data is valid
    if (!this.group || this.newExpense.amount <= 0 || !this.newExpense.description) {
      alert("Please provide a valid expense description and amount.");
      return;
    }

    // Check validations for custom and percentage splits
    if (this.newExpense.splitType === 'PERCENTAGE' && !this.validatePercentages()) {
      alert("Percentages must add up to 100.");
      return;
    }
    if (this.newExpense.splitType === 'CUSTOM' && !this.validateCustomAmounts()) {
      alert("Custom amounts must add up to the total amount.");
      return;
    }

    const expensePayload = {
      createdById: this.user.id,
      description: this.newExpense.description,
      amount: this.newExpense.amount,
      groupId: this.group.id,
      amountPaidBy: this.newExpense.paidBy,
      amountOwedBy: this.newExpense.owedBy,
      splitType: this.newExpense.splitType,
      percentages: this.newExpense.splitType === 'PERCENTAGE' ? this.percentages : {},
      customAmounts: this.newExpense.splitType === 'CUSTOM' ? this.customAmounts : {}
    };

    try {
      const response = await lastValueFrom(this.http.post("http://localhost:8080/expense", expensePayload, { responseType: 'text' }));
      alert(response); // Show response message
      this.loadExpenses(); // Reload the expenses after adding the new one
      this.resetExpenseForm(); // Reset form after submission
      this.loadGroupsUsersExpenses();
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Error adding expense. Please try again.");
    }
  }


  // Additional properties in the component to store custom amounts and percentages
  customAmounts: { [key: number]: number } = {}; // Keyed by user ID
  percentages: { [key: number]: number } = {}; // Keyed by user ID

  // Method to set the default percentage values equally across owed users
  initializePercentages() {
    const numOwedUsers = this.newExpense.owedBy.length;
    const equalPercentage = 100 / numOwedUsers;

    this.newExpense.owedBy.forEach(user => {
      this.percentages[user.id] = equalPercentage;
    });
  }

  // Method to set custom amounts default equally across owed users
  initializeCustomAmounts() {
    const equalAmount = this.newExpense.amount / this.newExpense.owedBy.length;

    this.newExpense.owedBy.forEach(user => {
      this.customAmounts[user.id] = equalAmount;
    });
  }

  // Method to validate that percentage splits add up to 100
  validatePercentages() {
    const total = Object.values(this.percentages).reduce((sum, val) => sum + val, 0);
    return total === 100;
  }

  // Method to validate that custom amounts add up to the total expense amount
  validateCustomAmounts() {
    const total = Object.values(this.customAmounts).reduce((sum, val) => sum + val, 0);
    return total === this.newExpense.amount;
  }




  async loadExpenses() {
    try {
      const expensesResponse = await fetch(`http://localhost:8080/expense/group/${this.group.id}`);
      this.expensesList = await expensesResponse.json();
    } catch (error) {
      console.error("Error loading expenses:", error);
      this.expensesList = [];
    }
  }

  async deleteExpense(expenseId: number) {
    try {
      const response = await lastValueFrom(this.http.delete(`http://localhost:8080/expense/${expenseId}`, { responseType: 'text' }));
      alert(response);
      this.loadExpenses(); // Reload the expenses after deletion
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Error deleting expense. Please try again.");
    }
  }

  resetExpenseForm() {
    this.newExpense.description = '';
    this.newExpense.amount = 0;
    this.newExpense.paidBy = [];
    this.newExpense.owedBy = [];
    this.newExpense.splitType = 'EQUAL';
  }

  selectedPaidUserId: number | null = null; // For selected user in Paid By section
  selectedOwedUserId: number | null = null; // For selected user in Owed By section


  addPaidUser() {
    const selectedUser = this.memberList.find(user => user.id == this.selectedPaidUserId);
    if (selectedUser && !this.newExpense.paidBy.some(member => member.id == selectedUser.id)) {
      this.newExpense.paidBy.push(selectedUser);
      this.selectedPaidUserId = null;
    }
  }

  removePaidUser(member: any) {
    this.newExpense.paidBy = this.newExpense.paidBy.filter(m => m.id !== member.id);
  }

  addOwedUser() {
    const selectedUser = this.memberList.find(user => user.id == this.selectedOwedUserId);
    if (selectedUser && !this.newExpense.owedBy.some(member => member.id == selectedUser.id)) {
      this.newExpense.owedBy.push(selectedUser);
      this.selectedOwedUserId = null;
    }
  }

  removeOwedUser(member: any) {
    this.newExpense.owedBy = this.newExpense.owedBy.filter(m => m.id !== member.id);
  }

}
