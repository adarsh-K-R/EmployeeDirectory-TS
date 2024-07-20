import Database from "./db.js";
import Employee from "./models/employee.js";
import Role from "./models/role.js";

declare const window: any;

class AddRole {
    private db: Database;
    private lastKeyPressed: string | null = null;

    // constructor to initialise values and call necessary functions
    constructor() {
        this.db = new Database();
        window.addEventListener("load", () => {
            document.addEventListener('click', (event) => {
                let withinEmployeeDropdown = (event.target as HTMLElement).closest('.assign-employee');
                if (!withinEmployeeDropdown) {
                    this.closeEmployeeDropdown();
                }
            }, true);
        });

        window.submitRoleForm= (event: SubmitEvent) => this.submitRoleForm(event);
        window.toggleEmployeeDropdown = (event: MouseEvent) => this.toggleEmployeeDropdown(event);
        window.handleTokenDelete = (event: KeyboardEvent) => this.handleTokenDelete(event);
        window.validateInput = (event: Event) => this.validateInput(event);
        window.openEmployeeDropdown = this.openEmployeeDropdown.bind(this);
        window.showUpdatedEmployeeList = this.showUpdatedEmployeeList.bind(this);
        window.removeEmployeeToken = this.removeEmployeeToken.bind(this);
    }

    // function to check if input field is empty or not (on blur)
    private validateInput(event: Event): void {
        let input = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        let errorElement = input.nextElementSibling as HTMLSpanElement;
        if (!input.value.trim()) {
            errorElement.style.display = "block";
        } else {
            errorElement.style.display = "none";
        }
    }

    // function to open the assign employee dropdown
    private openEmployeeDropdown(): void {
        (document.querySelector(".search-wrapper img") as HTMLImageElement).classList.add("expanded");
        (document.querySelector(".employee-dropdown-list") as HTMLDivElement).classList.add("show");
        this.showUpdatedEmployeeList();
    }

    // function to close the assign employee dropdown
    private closeEmployeeDropdown(): void {
        (document.querySelector(".search-wrapper img") as HTMLImageElement).classList.remove("expanded");
        (document.querySelector(".employee-dropdown-list") as HTMLDivElement).classList.remove("show");
    }

    // function to toggle the assign employee dropdown's state
    private toggleEmployeeDropdown(event: MouseEvent): void {
        event.stopPropagation();
        let employeeDropdownContainer = document.querySelector("#assign-employee-dropdown-container") as HTMLDivElement;
        let toggleState = employeeDropdownContainer.dataset.toggleState;
        if (toggleState === "expanded") {
            this.closeEmployeeDropdown();
            employeeDropdownContainer.dataset.toggleState = "collapsed";
        }
        else {
            this.openEmployeeDropdown();
            employeeDropdownContainer.dataset.toggleState = "expanded";
        }
    }

    // function to fetch and populate the employee list matching the criteria
    private async showUpdatedEmployeeList(): Promise<void> {
        const data: Employee[] = await this.db.getAllEmployees();

        const inputValue = (document.querySelector("#employee-search") as HTMLInputElement).value.toLowerCase();
        const dropdownList = document.querySelector(".employee-dropdown-list") as HTMLDivElement;
        const tokens = document.querySelectorAll(".token span");
        const tokenNames = Array.from(tokens).map(token => (token.textContent || '').trim().toLowerCase());
        const roleDepartment = (document.getElementById("role-department") as HTMLSelectElement).value.toUpperCase();
        const roleLocation = (document.getElementById("role-location") as HTMLSelectElement).value.toUpperCase();

        dropdownList.innerHTML = "";
        data.forEach(emp => {
            let name = emp.firstName + " " + emp.lastName;
            let photo = emp.profilePicture;
            let department = emp.department.toUpperCase();
            let jobTitle = emp.jobTitle.toUpperCase();
            let location = emp.location.toUpperCase();

            if ((inputValue === '' || name.toLowerCase().includes(inputValue))
                && (!tokenNames.includes(name.toLowerCase()))
                && (roleLocation === location)
                && (roleDepartment === department)
                && (jobTitle === "")) {
                const dropdownItem = document.createElement("div");
                dropdownItem.classList.add("dropdown-item");
                dropdownItem.setAttribute("data-empNo", emp.empNo);
                dropdownItem.innerHTML =
                    `<img class="emp-photo" src="${photo}" alt="${name}">
                <span>${name}</span>`;
                dropdownItem.addEventListener("click", () => this.addEmployeeToken(name, emp.empNo));
                dropdownList.appendChild(dropdownItem);
            }
        });
    }

    // function to add the selected employee's token in search bar
    private addEmployeeToken(name: string, empNo: string): void {
        const tokenContainer = document.querySelector(".search-wrapper") as HTMLDivElement;
        const token = document.createElement("div");
        token.classList.add("token");
        token.setAttribute("data-empNo", empNo);
        token.innerHTML =
        `<span>${name}</span>
        <button class="close-token" onclick="removeEmployeeToken(event)">x</button>`;
        tokenContainer.insertBefore(token, document.querySelector("#employee-search"));

        this.removeEmployeeFromDropdown(name);
        (document.querySelector("#employee-search") as HTMLInputElement).value = "";
        (document.querySelector("#employee-search") as HTMLInputElement).focus();
    }

    // function to remove the selected employee from dropdown
    private removeEmployeeFromDropdown(name: string): void {
        const dropdownItems = document.querySelectorAll(".employee-dropdown-list .dropdown-item");
        dropdownItems.forEach(item => {
            if (item.parentNode && (item.textContent || '').trim() === name) {
                item.parentNode.removeChild(item);
            }
        });
    }

    // function to remove the employee's token fromn search bar
    private removeEmployeeToken(event: MouseEvent): void {
        event.stopPropagation();
        const token = (event.target as HTMLButtonElement).parentNode as HTMLDivElement;
        const tokenContainer = token.parentNode as HTMLDivElement;
        tokenContainer.removeChild(token);

        this.showUpdatedEmployeeList();
    }

    // function to handle the removal of token deletion process
    private handleTokenDelete(event: KeyboardEvent): void {
        const key = event.key;
        const employeeSearch = document.querySelector("#employee-search") as HTMLInputElement;

        if (key === 'Backspace' || key === 'Delete') {
            if (employeeSearch.value === '') {
                if (this.lastKeyPressed === key) {
                    this.removeLastToken();
                    this.lastKeyPressed = null;
                }
                else {
                    this.lastKeyPressed = key;
                }
            } else {
                this.lastKeyPressed = null;
            }
        } else {
            this.lastKeyPressed = null;
        }
    }

    // function to remove the last token from search bar
    private removeLastToken(): void {
        const tokens = document.querySelectorAll(".token");
        const lastToken = tokens[tokens.length - 1];
        if (lastToken && lastToken.parentNode) {
            lastToken.parentNode.removeChild(lastToken);
            this.showUpdatedEmployeeList();
        }
    }

    // function to submit the role form and add the data to db if it passes all validations
    private async submitRoleForm(event: SubmitEvent): Promise<boolean | void> {
        event.preventDefault();        

        if (!await this.validate()) {
            return false;
        }

        this.addRoleData();

        (document.getElementById("add-role-form") as HTMLFormElement).reset();
        const tokens = document.querySelectorAll(".token");
        for (let i = 0; i < tokens.length; i++) {
            this.removeLastToken();
        }

        window.location.href = "./roles.html";
    }

    // function to check if input fields passes all validations or not (on submit)
    private async validate(): Promise<boolean> {
        let flag = true;
        
        const validations = [
            { inputId: 'role-name' },
            { inputId: 'role-department' },
            { inputId: 'role-location' },
            { inputId: 'role-description' }
        ];

        validations.forEach(function (validation) {
            const input = document.getElementById(validation.inputId) as HTMLSelectElement | HTMLInputElement;
            const error = input.nextElementSibling as HTMLSpanElement;
            if (input && error) {
                if (!input.value.trim()) {
                    error.style.display = "block";
                    flag = false;
                } else {
                    error.style.display = "none";
                }
            }
        });

        flag = await this.validateRoleUniqueness() && flag;

        return flag;
    }

    // function to check if a role already sxists or not based on its name, department and location
    private async validateRoleUniqueness(): Promise<boolean> {
        const roleName = (document.getElementById("role-name") as HTMLInputElement).value.trim();
        const roleDepartment = (document.getElementById("role-department") as HTMLSelectElement).value.trim();
        const roleLocation = (document.getElementById("role-location") as HTMLSelectElement).value.trim();

        const allRoles = await this.db.getAllRoles();
        const existingRole = allRoles.find(role => role.roleName.toUpperCase() === roleName.toUpperCase() && role.roleDepartment.toUpperCase() === roleDepartment.toUpperCase() && role.roleLocation.toUpperCase() === roleLocation.toUpperCase());
        const recordExistsError = document.getElementById("record-exists-error") as HTMLSpanElement;

        if (existingRole) {
            recordExistsError.style.display = "flex";
            return false;
        } else {
            recordExistsError.style.display = "none";
            return true;
        }
    }

    // function to add form data to db
    private async addRoleData(): Promise<void> {
        const roleName = (document.getElementById("role-name") as HTMLInputElement).value.trim();
        const roleDepartment = (document.getElementById("role-department") as HTMLSelectElement).value.trim();
        const roleDescription = (document.getElementById("role-description") as HTMLTextAreaElement).value.trim();
        const roleLocation = (document.getElementById("role-location") as HTMLSelectElement).value.trim();
    
        const tokens = document.querySelectorAll(".token");
        const selectedEmployees: string[] = [];
        tokens.forEach(token => {
            selectedEmployees.push(String(token.getAttribute("data-empNo")));
        });
    
        let roleData: Role = {
            roleName: roleName,
            roleDescription: roleDescription,
            roleDepartment: roleDepartment,
            roleLocation: roleLocation
        }
    
        const roleId = await this.db.addRole(roleData);
    
        selectedEmployees.forEach(async (emp) => {
            const employee = await this.db.getEmployeeByEmpNo(emp);
            if(employee) {
                employee.jobTitle = String(roleId);
                this.db.updateEmployee(employee);
            }
        })
    }
}

new AddRole();