import Database from "./db.js";
import Employee from "./models/employee.js";
import Role from "./models/role.js";

class RoleDetailsPage {
    private db: Database;
    private roleId: string;
    private roleName: string;

    // constructor to initialise values and call necessary functions
    constructor() {
        this.db = new Database();
        this.roleId = this.getRoleIdFromURL();
        this.roleName = "";
        this.initialisePage();
    }

    // function to extract roleId from URL search parameters
    private getRoleIdFromURL(): string {
        const params = new URLSearchParams(window.location.search);
        return String(params.get('id'));
    }

    // function to initialise the page
    private initialisePage(): void {
        this.fetchRoleDetails();
        this.fetchAndDisplayEmployees();
        (document.getElementById("add-emp-button") as HTMLAnchorElement).href = `./add-employee.html?id=${this.roleId}`;
    }

    // function to fetch role details from roleId
    private async fetchRoleDetails(): Promise<void> {
        const role: Role = await this.db.getRoleByRoleId(this.roleId);
        this.roleName = role.roleName;
        this.displayRoleInfo(role);
    }

    // function to fetch and display employee information in the current role
    private async fetchAndDisplayEmployees(): Promise<void> {
        const employees: Employee[] = await this.db.getAllEmployees();
        const roleDetailsContainer = document.querySelector(".role-detail-container") as HTMLDivElement;

        const employeesInRole: Employee[] = employees.filter(emp => emp.jobTitle === this.roleId);

        employeesInRole.forEach(employee => {
            roleDetailsContainer.innerHTML += this.generateEmployeeCard(employee);
        });
    }

    // function to display current role's name and description
    private displayRoleInfo(role: Role): void {
        const infoContainer = document.querySelector(".roles-info") as HTMLDivElement;
        infoContainer.children[0].textContent = role.roleName;
        infoContainer.children[1].textContent = role.roleDescription;
    }

    // function to generate the employee-card's HTML structure
    private generateEmployeeCard(employee: Employee): string {
        return `
            <div class="employee-card">
                <div class="employee-card-heading">
                    <img alt="Employee Avatar" src="${employee.profilePicture}">
                    <div>
                        <h4>${employee.firstName} ${employee.lastName}</h4>
                        <p>${this.roleName}</p>
                    </div>
                </div>
                <div class="employee-detail-card-info">
                    <div class="employee-detail-card-info-item">
                        <img id="employee-id-icon" alt="Employee Id Icon" src="/assets/images/interface/id-card.svg">
                        <span>${employee.empNo}</span>
                    </div>
                    <div class="employee-detail-card-info-item">
                        <img alt="Email Icon" src="/assets/images/interface/email.svg">
                        <span>${employee.email}</span>
                    </div>
                    <div class="employee-detail-card-info-item">
                        <img alt="Team Icon" src="/assets/images/interface/team.svg">
                        <span>${employee.department}</span>
                    </div>
                    <div class="employee-detail-card-info-item">
                        <img alt="Location Icon" src="/assets/images/interface/location-pin.svg">
                        <span>${employee.location}</span>
                    </div>
                </div>
                <div class="employee-card-view-all">
                    <span>View</span>
                    <img alt="Right Arrow Icon" src="/assets/images/interface/arrow-right.svg">
                </div>
            </div>
        `;
    }
}

new RoleDetailsPage();