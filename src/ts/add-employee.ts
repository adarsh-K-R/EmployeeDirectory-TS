import Employee from "./models/employee.js";
import Role from "./models/role.js";
import Database from "./db.js";

declare const window: any;

class AddEmployee {
    private db: Database;
    private toastIcon: { [key: string]: string };

    // constructor to initialise values and call necessary functions
    constructor() {
        this.db = new Database();
        this.toastIcon = {
            success: '<img alt="Done Icon" src="/assets/images/interface/done.svg">'
        };

        window.addEventListener("load", () => {
            this.initialiseForm();
        });

        window.submitForm = (event: SubmitEvent) => this.submitForm(event);
        window.updatePreviewImage = (event: Event) => this.updatePreviewImage(event);
        window.populateJobTitle = this.populateJobTitle.bind(this);
        window.validateInput = (event: Event) => this.validateInput(event);
        window.validateEmpNo = this.validateEmpNo.bind(this);
        window.validateFirstName = this.validateFirstName.bind(this);
        window.validateLastName = this.validateLastName.bind(this);
        window.validateEmail = this.validateEmail.bind(this);
        window.validateMobileNo = this.validateMobileNo.bind(this);
    }

    // function to initialise the form
    private async initialiseForm() {
        //set constraints for dob
        let today = new Date();
        let maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        let minDate = new Date(today.getFullYear() - 70, today.getMonth(), today.getDate());
        let formattedMaxDate = maxDate.toISOString().split('T')[0];
        let formattedMinDate = minDate.toISOString().split('T')[0];

        (document.getElementById('dob') as HTMLInputElement).setAttribute('max', formattedMaxDate);
        (document.getElementById('dob') as HTMLInputElement).setAttribute('min', formattedMinDate);

        // Fix jobTitle, Department and location
        const params = new URLSearchParams(window.location.search);
        const roleId = params.get('id');
        if(roleId) await this.populateReadOnlyFields(roleId);
    }

    // function to fix jobTitle, Department and location
    private async populateReadOnlyFields(roleId: string): Promise<void> {
        const role: Role = await this.db.getRoleByRoleId(roleId);
        if (role) {
            (document.getElementById("location") as HTMLSelectElement).value = role.roleLocation;
            (document.getElementById("location") as HTMLSelectElement).disabled = true;

            (document.getElementById("department") as HTMLSelectElement).value = role.roleDepartment;
            (document.getElementById("department") as HTMLSelectElement).disabled = true;

            (document.getElementById("job-title") as HTMLSelectElement).options[0] = new Option(role.roleName, role.id);
            (document.getElementById("job-title") as HTMLSelectElement).value = role.id!;
            (document.getElementById("job-title") as HTMLSelectElement).disabled = true;
        }
    }

    // function to populate the job title dropdown based on department & location
    private async populateJobTitle(): Promise<void> {
        const jobTitleDropdown = document.getElementById("job-title") as HTMLSelectElement;
        const locationSelected = (document.getElementById("location") as HTMLSelectElement).value;
        const departmentSelected = (document.getElementById("department") as HTMLSelectElement).value;
        jobTitleDropdown.length = 1; // Remove all options except the first one
        const rolesInSelectedDepartment: { id: string, name: string }[] = [];
        const allRoles = await this.db.getAllRoles();
        allRoles.forEach(role => {
            if ((role.roleDepartment === departmentSelected) && (role.roleLocation === locationSelected)) {
                rolesInSelectedDepartment.push({ id: (role.id as string), name: role.roleName });
            }
        });
        for (let i = 0; i < rolesInSelectedDepartment.length; i++) {
            jobTitleDropdown.options[jobTitleDropdown.options.length] = new Option(rolesInSelectedDepartment[i].name, rolesInSelectedDepartment[i].id);
        }
    }

    // function to check if required fields are empty or not (on blur)
    private validateInput(event: Event): void {
        let input = event.target as HTMLInputElement | HTMLSelectElement;
        let errorElement = input.nextElementSibling as HTMLSpanElement;
        if (!input.value.trim()) {
            errorElement.style.display = "block";
        } else {
            errorElement.style.display = "none";
        }
    }

    // function to check if entered empNo is unique or not and if it follows the specified format or not
    private async validateEmpNo(): Promise<boolean> {
        const empNoInput = document.getElementById("emp-no") as HTMLInputElement;
        const empError = empNoInput.nextElementSibling as HTMLSpanElement;
        const empNoRegex = /^TZ\d{5}$/;
        let isEmpNo = empNoRegex.test(empNoInput.value.trim());

        if (!empNoInput.value.trim()) {
            empError.style.display = "block";
            empError.innerHTML = "&#9888; This is a required field.";
            return false;
        } else if(!isEmpNo) {
            empError.style.display = "block";
            empError.innerHTML = "&#9888; Please enter empNo in required format (TZ12345).";
            return false;
        } else {
            const employee = await this.db.getEmployeeByEmpNo(empNoInput.value.trim());
            if (employee) {
                empError.style.display = "block";
                empError.innerHTML = "&#9888; Please enter unique empNo.";
                return false;
            } else {
                empError.style.display = "none";
            }
        }
        return true;
    }

    // function to validate first name
    private validateFirstName(): boolean {
        const firstNameInput = document.getElementById("first-name") as HTMLInputElement;
        const firstNameError = firstNameInput.nextElementSibling as HTMLSpanElement;
        const firstNameRegex = /^[a-zA-Z ]+$/;
        let isfirstName = firstNameRegex.test(firstNameInput.value.trim());
        if(!firstNameInput.value.trim()) {
            firstNameError.style.display = "block";
            firstNameError.innerHTML = "&#9888; This is a required field.";
            return false;
        }
        else if(!isfirstName) {
            firstNameError.style.display = "block";
            firstNameError.innerHTML = "&#9888; Please enter alphabets only.";
            return false;
        }
        else {
            firstNameError.style.display = "none";
            return true; 
        }
    }

    // function to validate last name
    private validateLastName(): boolean {
        const lastNameInput = document.getElementById("last-name") as HTMLInputElement;
        const lastNameError = lastNameInput.nextElementSibling as HTMLSpanElement;
        const lastNameRegex = /^[a-zA-Z]+$/;
        let islastName = lastNameRegex.test(lastNameInput.value.trim());
        if(!lastNameInput.value.trim()) {
            lastNameError.style.display = "block";
            lastNameError.innerHTML = "&#9888; This is a required field.";
            return false;
        }
        else if(!islastName) {
            lastNameError.style.display = "block";
            lastNameError.innerHTML = "&#9888; Please enter alphabets only.";
            return false;
        }
        else {
            lastNameError.style.display = "none";
            return true; 
        }
    }

    // function to validate if entered email id matches the standard format or not
    private validateEmail(): boolean {
        const emailInput = document.getElementById("email") as HTMLInputElement;
        const emailError = emailInput.nextElementSibling as HTMLSpanElement;
        const emailRegex = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
        let isEmail = emailRegex.test(emailInput.value.trim());
        if(!emailInput.value.trim()) {
            emailError.style.display = "block";
            emailError.innerHTML = "&#9888; This is a required field.";
            return false;
        }
        else if(!isEmail) {
            emailError.style.display = "block";
            emailError.innerHTML = "&#9888; Please enter proper email id.";
            return false;
        }
        else {
            emailError.style.display = "none";
            return true; 
        }
    }

    // function to validate if entered mobile number is in correct format or not
    private validateMobileNo(): boolean {
        const mobileNoInput = document.getElementById("mobile-no") as HTMLInputElement;
        const mobileNoError = mobileNoInput.nextElementSibling as HTMLSpanElement;
        const mobileNoRegex = /^\d{10}$|^$/;
        let isMobileNo = mobileNoRegex.test(mobileNoInput.value.trim());
        if(!isMobileNo){
            mobileNoError.style.display = "block";
            mobileNoError.innerHTML = "&#9888; Please enter proper mobile number."
            return false;
        }
        else{
            mobileNoError.style.display = "none";
            return true;
        }
    }

    // function to submit the add employee form after validating it
    private async submitForm(event: SubmitEvent) {
        event.preventDefault();

        if (!await this.validate()) {
            return false;
        }

        this.addEmployeeData();
    }

    //function to make required changes and add the form data to db
    private async addEmployeeData(): Promise<void> {
        let input = document.getElementById("profile-pic") as HTMLInputElement;
        if (input.files) {
            let profilePicture = input.files[0];
            const empNo = (document.getElementById("emp-no") as HTMLInputElement).value.trim();
            const firstName = (document.getElementById("first-name") as HTMLInputElement).value.trim().replace(/\s+/g, ' ');
            const lastName = (document.getElementById("last-name") as HTMLInputElement).value.trim();
            const dob = (document.getElementById("dob") as HTMLInputElement).value;
            const email = (document.getElementById("email") as HTMLInputElement).value.trim();
            const mobileNo = (document.getElementById("mobile-no") as HTMLInputElement).value.trim();
            let joinDate = (document.getElementById("join-date") as HTMLInputElement).value;
            const location = (document.getElementById("location") as HTMLSelectElement).value;
            const jobTitle = (document.getElementById("job-title") as HTMLSelectElement).value;
            const department = (document.getElementById("department") as HTMLSelectElement).value;
            const assignManager = (document.getElementById("assign-manager") as HTMLSelectElement).value;
            const assignProject = (document.getElementById("assign-project") as HTMLSelectElement).value;

            const statusState = ["Active", "Inactive"];
            const status = statusState[Math.floor(Math.random() * statusState.length)];

            joinDate = this.formatDate(joinDate);

            const reader = new FileReader();
            reader.onload = () => {
                const imageDataUrl = reader.result;
                let empData: Employee = {
                    profilePicture: imageDataUrl,
                    empNo: empNo,
                    firstName: firstName,
                    lastName: lastName,
                    dob: dob,
                    email: email,
                    mobileNo: mobileNo,
                    joinDate: joinDate,
                    location: location,
                    jobTitle: jobTitle,
                    department: department,
                    assignManager: assignManager,
                    assignProject: assignProject,
                    status: status
                };
                this.db.addEmployee(empData);
            };

            if (!profilePicture) {
                const defaultImageUrl = '/assets/images/interface/profile.png';

                await fetch(defaultImageUrl)
                    .then(response => response.blob())
                    .then(blob => {
                        profilePicture = new File([blob], 'default_image.jpg', { type: 'image/jpeg' });
                    });
            }

            reader.readAsDataURL(profilePicture);

            (document.getElementById("add-employee-form") as HTMLFormElement).reset();
            (document.getElementById("preview-img") as HTMLImageElement).setAttribute("src", "/assets/images/interface/profile.png");

            this.showToast("Employee Added Successfully", "success", 4000);
        }
    }

    // function to make date format DD-MM-YYYY
    private formatDate(dateString: string): string {
        let parts = dateString.split("-");
        let formattedDate = parts[2] + "-" + parts[1] + "-" + parts[0];
        return formattedDate;
    }

    // function to check if all entered values is valid or not (on submit)
    private async validate(): Promise<boolean> {
        let flag = true;

        flag = await this.validateEmpNo() && flag;
        flag = this.validateFirstName() && flag;
        flag = this.validateLastName() && flag;
        flag = this.validateEmail() && flag;
        flag = this.validateMobileNo() && flag;

        const validations = [
            { inputId: 'join-date' },
            { inputId: 'department' },
            { inputId: 'location' },
        ];

        validations.forEach((validation) => {
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
        return flag;
    }

    // function to show toast on successful submit of form data
    private showToast(message: string = "Sample Message", toastType: string = "info", duration: number = 5000): void {
        if (!Object.keys(this.toastIcon).includes(toastType)) toastType = "info";

        let box = document.createElement("div");
        box.classList.add("toast", `toast-${toastType}`);
        box.innerHTML = ` <div class="toast-content-wrapper"> 
                    <div class="toast-icon"> 
                    ${this.toastIcon[toastType]} 
                    </div> 
                    <div class="toast-message">${message}</div> 
                    <div class="toast-progress"></div> 
                    </div>`;
        duration = duration || 5000;
        (box.querySelector(".toast-progress") as HTMLDivElement).style.animationDuration = `${duration / 1000}s`;

        let toastExists = document.body.querySelector(".toast");
        if (toastExists) {
            toastExists.remove();
        }

        document.body.appendChild(box);
    }

    // function to show the profic picture after upload
    private async updatePreviewImage(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const preview = document.getElementById("preview-img");
        let reader;

        if (input && preview && input.files && input.files[0]) {
            reader = new FileReader();
            reader.onload = function (e) {
                if (e.target) {
                    preview.setAttribute('src', e.target.result as string);
                }
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
}

new AddEmployee();