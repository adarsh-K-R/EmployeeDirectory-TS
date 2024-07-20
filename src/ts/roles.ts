import Database from "./db.js";
import Role from "./models/role.js";

declare const window: any;

class ViewRoles {
    private db: Database;
    private rolesContainer: HTMLDivElement;

    // constructor to initialise values and call necessary functions
    constructor() {
        this.db = new Database();
        this.rolesContainer = document.querySelector(".roles-container") as HTMLDivElement;
        window.addEventListener("load", () => {
            document.addEventListener("click", (event) => {
                this.hideDropdowns(event);
            });
            this.fetchAndDisplayRoles();
        });

        window.applyFilters = this.applyFilters.bind(this);
        window.toggleDropdown = this.toggleDropdown.bind(this);
        window.updateSelectedOptions = this.updateSelectedOptions.bind(this);
        window.resetFilters = this.resetFilters.bind(this);
    }

    // function to fetch data and display them
    private async fetchAndDisplayRoles(): Promise<void> {
        const roleData = await this.db.getAllRoles() as Role[];

        roleData.forEach((role) => {
            this.rolesContainer.innerHTML += this.generateRoleCardHTML(role);
        });
    }

    //function to generate role-card's HTML structure
    private generateRoleCardHTML(role: Role): string {
        return `<div class="roles-card">
                    <div class="roles-card-heading">
                        <h3>${role.roleName}</h3>
                        <img alt="Edit Icon" src="/assets/images/interface/edit.svg">
                    </div>
                    <div class="roles-card-details">
                        <div class="roles-card-details-item">
                            <div class="card-icon-title">
                                <img alt="Team Icon" src="/assets/images/interface/team.svg">
                                <span>Department</span>
                            </div>
                            <p class="role-department">${role.roleDepartment}</p>
                        </div>
                        <div class="roles-card-details-item">
                            <div class="card-icon-title">
                                <img alt="Location Icon" src="/assets/images/interface/location-pin.svg">
                                <span>Location</span>
                            </div>
                            <p class="role-location">${role.roleLocation}</p>
                        </div>
                        <div class="roles-card-details-item">
                            <span>Total Employees</span>
                            <span class="total-employees-icons">
                                <img class="icon-1" src="/assets/images/profile-pics/female-dark-blue.svg" alt="Profile Avatar">
                                <img class="icon-2" src="/assets/images/profile-pics/female-yellow.svg" alt="Profile Avatar">
                                <img class="icon-3" src="/assets/images/profile-pics/male-green.svg" alt="Profile Avatar">
                                <img class="icon-4" src="/assets/images/profile-pics/male-purple.svg" alt="Profile Avatar">
                                <div class="total-count">+43</div>
                            </span>
                        </div>
                    </div>
                    <a href="role-details.html?id=${role.id}" class="view-all-employees">
                        <div class="roles-card-view-all">
                            <span>View all Employees</span>
                            <img alt="Right Arrow Icon" src="/assets/images/interface/arrow-right.svg">
                        </div>
                    </a>
                </div>`;
    }

    // function to collapse/hide filter dropdown
    private hideDropdowns(event: MouseEvent): void {
        const multiselectDropdown = document.querySelectorAll('.multiselect');

        multiselectDropdown.forEach(dropdown => {
            if ((event.target) && !(event.target as HTMLDivElement).classList.contains('multiselect') && !(event.target as HTMLElement).classList.contains('selected-options')) {
                dropdown.children[1].classList.remove('show');
            }
        });
    }

    // function to toggle the filter dropdown state
    private toggleDropdown(event: MouseEvent): void {
        (event.currentTarget as HTMLDivElement).children[1].classList.toggle("show");
    }

    // function to update the filter's text based on selected filters
    private updateSelectedOptions(event: MouseEvent, filter: string): void {
        // Update selected options implementation
        let checkboxes = (event.target as HTMLInputElement).parentNode?.parentNode?.querySelectorAll('input[type="checkbox"]:checked');
        let selectedOptions: string[] = [];
        if(checkboxes) {
            checkboxes.forEach(function(checkbox) {
                selectedOptions.push((checkbox as HTMLInputElement).value);
            });
        }
        let selectedOptionsText = selectedOptions.join(", ");
        const selectedOptionsElement = (event.target as HTMLInputElement).parentNode?.parentNode?.parentNode?.querySelector('.selected-options');
        if (selectedOptionsElement) {
            selectedOptionsElement.textContent = selectedOptionsText || filter;
        }

        let disable = true;

        disable = (document.querySelectorAll(".property-filter-options input[type='checkbox']:checked").length === 0) ? true : false;

        if(disable){
            (document.getElementById("filter-reset") as HTMLButtonElement).click();
        }

        document.querySelectorAll(".filter-action-buttons button").forEach(btn => {
            (btn as HTMLButtonElement).disabled = disable; 
        });
    }

    // function to reset all filters
    private resetFilters(): void {
        // Reset filters implementation
        (document.getElementById('department-filter') as HTMLDivElement).textContent='Department';
        (document.getElementById('location-filter') as HTMLDivElement).textContent='Location';
        
        let selectedPropertyFilters = document.querySelectorAll('.property-filter-options input[type="checkbox"]:checked');
        const buttons = document.querySelectorAll(".filter-action-buttons button");

        buttons.forEach(btn => {
            (btn as HTMLButtonElement).disabled = true;
        })
        selectedPropertyFilters.forEach(selectedPropertyFilter => {
            (selectedPropertyFilter as HTMLInputElement).checked = false;
        });
        this.applyFilters();
    }

    // function to apply the selected filters
    private applyFilters(): void {
        // Apply filters implementation
        const selectedDepartments = ((document.querySelector('#department-filter') as HTMLDivElement).textContent || '').toUpperCase().split(", ");
        const selectedLocations = ((document.querySelector('#location-filter') as HTMLDivElement).textContent || '').toUpperCase().split(", ");
        const roleCards = document.querySelectorAll('.roles-card');

        roleCards.forEach(roleCard => {
            const department = ((roleCard.querySelector('.role-department') as HTMLParagraphElement).textContent || '').trim().toUpperCase();
            const location = ((roleCard.querySelector('.role-location') as HTMLParagraphElement).textContent || '').trim().toUpperCase();

            const departmentMatch = selectedDepartments.includes("DEPARTMENT") || selectedDepartments.includes(department);
            const locationMatch = selectedLocations.includes('LOCATION') || selectedLocations.includes(location);

            if(departmentMatch && locationMatch) {
                (roleCard as HTMLDivElement).style.display = '';
            }
            else {
                (roleCard as HTMLDivElement).style.display = 'none';
            }        
        });
    }
}

new ViewRoles();