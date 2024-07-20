import Database from "./db.js";
import Employee from "./models/employee.js";
import Role from "./models/role.js";

declare const window: any;

class ViewEmployees {
    private sortingOrder = 1; // 0: original, 1:ascending, 2:descending
    private originalOrder: HTMLTableRowElement[] = [];
    private tableBody: HTMLElement;
    private db: Database;

    // constructor to initialise values and call necessary functions
    constructor() {
        this.db = new Database();
        this.tableBody = document.getElementById("employee-table-body") as HTMLElement;
        window.addEventListener("load", ()=> {
            document.addEventListener("click", (event) => {
                this.hideDropdowns(event);
            });
            
            this.renderAlphabetFilter();
            this.fetchAndDisplayData();
        });

        window.toggleDropdown = (event: MouseEvent) => this.toggleDropdown(event);
        window.updateSelectedOptions = (event: MouseEvent, filter: string) => this.updateSelectedOptions(event, filter);
        window.sortTable = (columnIndex: number, dataType: string) => this.sortTable(columnIndex, dataType);
        window.toggleEmployeeActionsPopup = (event: MouseEvent) => this.toggleEmployeeActionsPopup(event);
        window.exportToCSV = this.exportToCSV.bind(this);
        window.applyFilters = this.applyFilters.bind(this);
        window.resetFilters = this.resetFilters.bind(this);
        window.deleteSelectedRows = this.deleteSelectedRows.bind(this);
        window.toggleSelectAllEmployees = this.toggleSelectAllEmployees.bind(this);
        window.updateDeleteButtonState = this.updateDeleteButtonState.bind(this);
    }

    // Function to render alphabet filter elements
    private renderAlphabetFilter(): void {
        const container = document.getElementById('alphabet-list');

        if(container) {
            for (let i = 1; i <= 26; i++) {
                container.innerHTML += "<div class='radio-container'>" + 
                                            "<input type='radio' name='alphabet' id='" + String.fromCharCode(64 + i) + "' value='" + String.fromCharCode(64 + i) + "' onchange='applyFilters()'>" + 
                                            "<label class='radio-label' for='" + String.fromCharCode(64 + i) + "' > " + String.fromCharCode(64 + i) + 
                                            "</label>" + 
                                        "</div>";
            }
        }
    }

    // Function to hide dropdowns on outside click
    private hideDropdowns(event: MouseEvent): void {
        const ellipsesDropdown = document.querySelector('.ellipses-popup.active');

        if((event.target) &&  !(event.target as HTMLElement).classList.contains('ellipses-span')){
            if(ellipsesDropdown) {
                ellipsesDropdown.classList.remove("active");
                (ellipsesDropdown as HTMLDivElement).style.display = "none";
            }
        }

        const multiselectDropdown = document.querySelectorAll('.multiselect');
        multiselectDropdown.forEach(dropdown => {
            if((event.target) && !(event.target as HTMLDivElement).classList.contains('multiselect') && !(event.target as HTMLElement).classList.contains('selected-options')){
                dropdown.children[1].classList.remove('show');
            }
        })
    }

    // Function to fetch data and display it
    private async fetchAndDisplayData(): Promise<void> {
        const data: Employee[] = await this.db.getAllEmployees();
            
        const promises = data.map(async (employee) => {     
            let role: Role;
            let roleName = "NA";
            if(employee.jobTitle !== "") {
                role = await this.db.getRoleByRoleId(employee.jobTitle);  
                roleName = role.roleName; 
            }  
            this.tableBody.innerHTML += this.generateTableRowHTML(employee, roleName);            
        });
        
        await Promise.all(promises);
        this.originalOrder = Array.from(this.tableBody.querySelectorAll('tr'));
    }    

    // function to generate a table row in required format
    private generateTableRowHTML(employee: Employee, roleName: string): string {
        return `<tr data-id="${employee.id}"> 
                    <td class='select-employee-checkbox'> 
                        <input class='row-checkbox check-box' type='checkbox' onchange='updateDeleteButtonState()'>
                    </td>
                    <td class='employee-cell-info'>
                        <img class='employee-image' alt='Employee Image' src='${employee.profilePicture}'>
                        <div class='employee-cell-name-email'>
                            <p class='employee-cell-name'>${employee.firstName} ${employee.lastName}</p>
                            <p class='employee-cell-email'>${employee.email}</p>
                        </div>
                    </td>
                    <td>${employee.location}</td>
                    <td>${employee.department}</td>
                    <td>${roleName}</td>
                    <td>${employee.empNo}</td>
                    <td>
                        <div class='employee-status ${(employee.status === 'Inactive' ? "inactive" : "")}'>
                            ${employee.status}
                        </div>
                    </td>
                    <td>${employee.joinDate}</td>
                    <td class='ellipses'>
                        <span class='ellipses-span' onclick='toggleEmployeeActionsPopup(event)'>
                            &#8943;
                        </span>
                        <div class='ellipses-popup'>
                            <p>View</p>
                            <hr>
                            <p>Edit</p>
                            <hr>
                            <p>Delete</p>
                        </div>
                    </td>
                </tr>`;
    }

    // Function to update delete button state
    private updateDeleteButtonState(): void {
        const checkboxes = document.querySelectorAll('.row-checkbox');
        const button = document.getElementById('delete-btn') as HTMLButtonElement;
        const isChecked = Array.from(checkboxes).some(checkbox => (checkbox as HTMLInputElement).checked);
        button.disabled = !isChecked;
        if(button.disabled) {
            (document.getElementById('select-all-checkbox') as HTMLInputElement).checked = false;
        }
    }

    // Function to delete selected rows from table and db
    private deleteSelectedRows(): void {
        const checkboxes = document.querySelectorAll('.row-checkbox:checked');
        checkboxes.forEach(checkbox => {
            const row = checkbox.closest('tr') as HTMLTableRowElement;
            const id = row.getAttribute("data-id") as string;
            this.db.removeEmployee(id);
            row.remove();
            this.updateDeleteButtonState();
            (document.getElementById('select-all-checkbox') as HTMLInputElement).checked = false;
        });
    }

    // Function to toggle select all employees checkbox's state
    private toggleSelectAllEmployees(): void {
        let checkboxes = document.querySelectorAll('.row-checkbox');
        checkboxes.forEach((checkbox) => {
            if((checkbox.closest('tr') as HTMLTableRowElement).style.display != "none"){
                (checkbox as HTMLInputElement).checked = (document.getElementById("select-all-checkbox") as HTMLInputElement).checked;
            }
        });
        this.updateDeleteButtonState();
    };

    // Function to apply selected filters to table
    private applyFilters(): void {
        const selectedLetter = (document.querySelector('input[name="alphabet"]:checked') as HTMLInputElement).value.toUpperCase();
        const selectedDepartments = ((document.querySelector('#department-filter') as HTMLDivElement).textContent || '').toUpperCase().split(", ");
        const selectedLocations = ((document.querySelector('#location-filter') as HTMLDivElement).textContent || '').toUpperCase().split(", ");
        const selectedStatuses = ((document.querySelector('#status-filter') as HTMLDivElement).textContent || '').toUpperCase().split(", ");
        const rows = document.querySelectorAll('#employee-table tbody tr');

        if(selectedLetter === ''){
            (document.getElementById('filter-logo') as HTMLImageElement).setAttribute("src", "/assets/images/interface/filter-black.svg");
        } else {
            (document.getElementById('filter-logo') as HTMLImageElement).setAttribute("src", "/assets/images/interface/filter.svg");
        }

        rows.forEach(row => {
            const name = ((row.querySelector('td:nth-child(2) .employee-cell-name-email .employee-cell-name') as HTMLParagraphElement).textContent || '').trim().toUpperCase();
            const department = ((row.querySelector('td:nth-child(4)') as HTMLTableCellElement).textContent || '').trim().toUpperCase();
            const location = ((row.querySelector('td:nth-child(3)') as HTMLTableCellElement).textContent || '').trim().toUpperCase();
            const status = ((row.querySelector('td:nth-child(7)') as HTMLTableCellElement).textContent || '').trim().toUpperCase();

            const alphabetMatch = selectedLetter === '' || name.startsWith(selectedLetter);
            const departmentMatch = selectedDepartments.includes("DEPARTMENT") || selectedDepartments.includes(department);
            const locationMatch = selectedLocations.includes('LOCATION') || selectedLocations.includes(location);
            const statusMatch = selectedStatuses.includes('STATUS') || selectedStatuses.includes(status);

            if(alphabetMatch && departmentMatch && locationMatch && statusMatch) {
                (row as HTMLTableRowElement).style.display = '';
            }
            else {
                (row as HTMLTableRowElement).style.display = 'none';
            }        
        });
    }

    // Function to reset filters
    private resetFilters(): void {
        (document.getElementById('status-filter') as HTMLDivElement).textContent='Status';
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

    // Function to sort table
    private sortTable(columnIndex: number, dataType: string): void {
        const tbody = (document.getElementById('employee-table-body') as HTMLElement);
        const rows = Array.from(tbody.querySelectorAll('tr'));

        if(this.sortingOrder === 0) {
            (document.querySelector(`thead th:nth-child(${columnIndex + 1}) div img:nth-child(1)`) as HTMLImageElement).setAttribute("src", "/assets/images/interface/down-arrow-black.svg");
            (document.querySelector(`thead th:nth-child(${columnIndex + 1}) div img:nth-child(2)`) as HTMLImageElement).setAttribute("src", "/assets/images/interface/down-arrow-black.svg");
            tbody.innerHTML = '';
            this.originalOrder.forEach(row => tbody.appendChild(row));
            this.sortingOrder++;
            return;
        }

        if(this.sortingOrder === 1){
            (document.querySelector(`thead th:nth-child(${columnIndex + 1}) div img:nth-child(1)`) as HTMLImageElement).setAttribute("src", "/assets/images/interface/down-arrow-red.svg");
            (document.querySelector(`thead th:nth-child(${columnIndex + 1}) div img:nth-child(2)`) as HTMLImageElement).setAttribute("src", "/assets/images/interface/down-arrow-black.svg");
        }

        if(this.sortingOrder === 2){
            (document.querySelector(`thead th:nth-child(${columnIndex + 1}) div img:nth-child(1)`) as HTMLImageElement).setAttribute("src", "/assets/images/interface/down-arrow-black.svg");
            (document.querySelector(`thead th:nth-child(${columnIndex + 1}) div img:nth-child(2)`) as HTMLImageElement).setAttribute("src", "/assets/images/interface/down-arrow-red.svg");
        }

        rows.sort((a, b) => {
            const aValue = (a.children[columnIndex].textContent || '').trim();
            const bValue = (b.children[columnIndex].textContent || '').trim();

            let comparison = 0;

            switch(dataType) {
                case 'alphabetical' : 
                    comparison = aValue.localeCompare(bValue);
                    break;
                
                case 'alphanumeric' :
                    comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
                    break;

                case 'date' : 
                    comparison = this.compareDates(aValue, bValue);
                    break;
            }

            return this.sortingOrder === 1 ? comparison : (this.sortingOrder === 2 ? -comparison : 0);
        });

        tbody.innerHTML = '';
        rows.forEach(row => tbody.appendChild(row));
        this.sortingOrder = (this.sortingOrder + 1) % 3;    
    }

    // Function to compare dates
    private compareDates(a: string, b: string): number {
        const [dayA, monthA, yearA] = a.split("-").map(Number);
        const [dayB, monthB, yearB] = b.split("-").map(Number);

        const dateA = new Date(yearA, monthA - 1, dayA); // Month is 0-indexed in JavaScript Date
        const dateB = new Date(yearB, monthB - 1, dayB);

        return dateA.valueOf() - dateB.valueOf();
    }

    // Function to export table data to CSV
    private exportToCSV(): void {
        const rows = document.querySelectorAll('#employee-table #employee-table-body tr');
        let csvContent = "data:text/csv;charset=utf-8,";

        const header = Array.from(document.querySelectorAll('#employee-table #employee-table-header th'))
                            .slice(1, -2)
                            .map(th => {
                                if((th.textContent || '').trim() === 'USER'){
                                    return 'User Name,User Email';
                                }
                                else {
                                    return (th.textContent || '').trim();
                                }
                            });
        csvContent += header.join(",") + "\n";

        rows.forEach(row => {
            if((row as HTMLTableRowElement).style.display != 'none'){
                const rowData = Array.from(row.children)
                                    .slice(1, -2)
                                    .map(cell => {
                                        const secondChild = cell.children[1];

                                        if(secondChild && secondChild.tagName.toLowerCase() === 'div') {
                                            const name = ((cell.children[1].querySelector('p:nth-child(1)') as HTMLParagraphElement).textContent || '').trim();
                                            const email = ((cell.children[1].querySelector('p:nth-child(2)') as HTMLParagraphElement).textContent || '').trim();
                                            
                                            return `${name},${email}`;
                                        }
                                        else {
                                            return (cell.textContent || '').trim();
                                        }
                });
                csvContent += rowData.join(",") + "\n";
            }
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "employee_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Function to toggle ellipses
    private toggleEmployeeActionsPopup(event: MouseEvent): void {
        let activeActionsPopup = document.querySelector(".ellipses-popup.active");
        if(activeActionsPopup){
            activeActionsPopup.classList.remove("active");
            (activeActionsPopup as HTMLDivElement).style.display = "none";

            if(activeActionsPopup !== (event.target as HTMLElement).nextElementSibling) {
                ((event.target as HTMLElement).nextElementSibling as HTMLElement).classList.add("active");
                ((event.target as HTMLElement).nextElementSibling as HTMLElement).style.display = 'block';
            } 
        }
        else {
            ((event.target as HTMLElement).nextElementSibling as HTMLElement).classList.add("active");
            ((event.target as HTMLElement).nextElementSibling as HTMLElement).style.display = 'block';
        }
    }

    // Function to toggle multiselect dropdowns
    private toggleDropdown(event: MouseEvent): void {
        (event.currentTarget as HTMLDivElement).children[1].classList.toggle("show");
    }

    // Function to get selected property filters and update them
    private updateSelectedOptions(event: MouseEvent, filter: string): void {
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
}

new ViewEmployees();