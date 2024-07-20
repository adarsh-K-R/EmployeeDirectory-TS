export default interface Employee {
    id?: string,
    profilePicture: string | ArrayBuffer | null;
    empNo: string;
    firstName: string;
    lastName: string;
    dob: string;
    email: string;
    mobileNo: string;
    joinDate: string;
    location: string;
    jobTitle: string;
    department: string;
    assignManager: string;
    assignProject: string;
    status: string;
}