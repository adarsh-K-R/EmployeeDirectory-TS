import Employee from "./models/employee";
import Role from "./models/role";

class Database {
    private baseUrl: string;
    private employeeData: string;
    private roleData: string;

    constructor() {
        this.baseUrl = "http://localhost:3000/";
        this.employeeData = "empData";
        this.roleData = "roleData";
    }

    // function to add an employee
    public addEmployee(user: Employee): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.open("POST", this.baseUrl + this.employeeData);
            xhttp.setRequestHeader("Content-Type", "application/json");
            xhttp.onload = function () {
                if (xhttp.status === 201) {
                    resolve("Data added successfully");
                } else {
                    reject(`Error adding data ${xhttp.status}`);
                }
            };
            xhttp.onerror = function () {
                reject("Error adding data");
            };
            xhttp.send(JSON.stringify(user));
        });
    }

    // function to get all employees
    public getAllEmployees(): Promise<Employee[]> {
        return new Promise<Employee[]>((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.open("GET", `${this.baseUrl} ${this.employeeData}`);
            xhttp.onload = function () {
                if (xhttp.status === 200) {
                    resolve(JSON.parse(xhttp.responseText));
                } else {
                    reject("Error fetching data");
                }
            };
            xhttp.onerror = function () {
                reject("Error fetching data");
            };
            xhttp.send();
        });
    }

    // function to delete an employee
    public removeEmployee(id: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.open("DELETE", `${this.baseUrl + this.employeeData}/${id}`);
            xhttp.onload = function () {
                if (xhttp.status === 200) {
                    resolve("Employee removed successfully");
                } else {
                    reject("Error removing employee");
                }
            };
            xhttp.onerror = function () {
                reject("Error removing employee");
            };
            xhttp.send();
        });
    }
    
    // function to retrieve an employee by its empNo
    public getEmployeeByEmpNo(empNo: string): Promise<Employee | undefined> {
        return new Promise<Employee | undefined>((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.open("GET", `${this.baseUrl + this.employeeData}`);
            xhttp.onload = function () {
                if (xhttp.status === 200) {
                    const employees: Employee[] = JSON.parse(xhttp.responseText);
                    const employee = employees.find(emp => emp.empNo === empNo);
                    if (employee) {
                        resolve(employee);
                    } else {
                        resolve(undefined);
                    }
                } else {
                    reject("Error fetching employee");
                }
            };
            xhttp.onerror = function () {
                reject("Error fetching employee");
            };
            xhttp.send();
        });
    }

    // function to update an employee data
    public updateEmployee(data: Employee): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.open("PUT", `${this.baseUrl + this.employeeData}/${data.id}`);
            xhttp.setRequestHeader("Content-Type", "application/json");
            xhttp.onload = function () {
                if (xhttp.status === 200) {
                    resolve("Employee data updated successfully");
                } else {
                    reject("Error updating employee data");
                }
            };
            xhttp.onerror = function () {
                reject("Error updating employee data");
            };
            xhttp.send(JSON.stringify(data));
        });
    }

    // function to add role
    public addRole(roleData: Role): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.open("POST", this.baseUrl + this.roleData);
            xhttp.setRequestHeader("Content-Type", "application/json");
            xhttp.onload = function () {
                if (xhttp.status === 201) {
                    resolve(JSON.parse(xhttp.responseText).id);
                } else {
                    reject("Error adding role data");
                }
            };
            xhttp.onerror = function () {
                reject("Error adding role data");
            };
            xhttp.send(JSON.stringify(roleData));
        });
    }

    // function to get all roles
    public getAllRoles(): Promise<Role[]> {
        return new Promise<Role[]>((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.open("GET", this.baseUrl + this.roleData);
            xhttp.onload = function () {
                if (xhttp.status === 200) {
                    resolve(JSON.parse(xhttp.responseText));
                } else {
                    reject("Error getting all roles");
                }
            };
            xhttp.onerror = function () {
                reject("Error getting all roles");
            };
            xhttp.send();
        });
    }

    // function to get a specific role data from its roleId
    public getRoleByRoleId(roleId: string): Promise<Role> {
        return new Promise<Role>((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.open("GET", `${this.baseUrl + this.roleData}/${roleId}`);
            xhttp.onload = function () {
                if (xhttp.status === 200) {
                    resolve(JSON.parse(xhttp.responseText));
                } else {
                    reject(`Error getting role with id ${roleId}`);
                }
            };
            xhttp.onerror = function () {
                reject(`Error getting role with id ${roleId}`);
            };
            xhttp.send();
        });
    }
}

export default Database;