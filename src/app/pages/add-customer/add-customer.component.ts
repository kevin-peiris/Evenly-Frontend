import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.css']
})
export class AddCustomerComponent implements OnInit {
  
  public customer: any = {
    name: "",
    address: "",
    email: ""
  };
  public customers: any = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTable();
  }

  public addCustomer(): void {
    this.http.post("http://localhost:8080/customer/add-customer", this.customer).subscribe((data) => {
      alert("Customer Added!");
      this.customer = { name: "", address: "", email: "" }; // Clear form fields
      this.loadTable(); // Refresh the customer list
    });
  }

  loadTable() {
    this.http.get("http://localhost:8080/donor/get-customer").subscribe(data => {
      console.log(data);
      this.customers = data;

    })
  }
  
}