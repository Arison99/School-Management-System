import { useEffect, useState } from "react";
import axios from "axios"; // Import axios
import {
    BookOpen,
    Users,
    List as ListIcon,
    User as UserIcon,
    School as SchoolIcon,
} from "lucide-react";

const Home = () => {
    const [schoolData, setSchoolData] = useState(null);

    useEffect(() => {
        const fetchHomeData = async () => { // Create an async function to fetch data
            try {
                const response = await axios.get('http://localhost:5000/api/home-data'); // Fetch from the new endpoint
                setSchoolData(response.data); // Set the fetched data to state
            } catch (error) {
                console.error("Error fetching home data:", error);
            }
        };

        fetchHomeData(); // Call the fetch function
    }, []); // Empty dependency array to run only once on component mount

    if (!schoolData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">Loading data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Welcome Message */}
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">
                        Welcome to the School Management System
                    </h1>
                </header>

                {/* School / Institute Details */}
                <section className="bg-white shadow rounded p-6 mb-8">
                    <div className="flex flex-col sm:flex-row items-center">
                        <img
                            src={schoolData.photo}
                            alt="School"
                            className="w-32 h-32 rounded object-cover mr-6 mb-4 sm:mb-0"
                        />
                        <div>
                            <h2 className="text-2xl font-bold">{schoolData.name}</h2>
                            <p className="text-gray-600 flex items-center">
                                <SchoolIcon className="mr-1" size={18} /> {schoolData.type}
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <h3 className="font-semibold">Registration Number</h3>
                            <p className="text-gray-700">{schoolData.registrationNumber}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">License Number</h3>
                            <p className="text-gray-700">{schoolData.licenseNumber}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">TIN</h3>
                            <p className="text-gray-700">{schoolData.tin}</p>
                        </div>
                    </div>
                </section>

                {/* Head Master / Principal / VC */}
                <section className="bg-white shadow rounded p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-4">Head Master / Principal / VC</h2>
                    <div className="flex items-center">
                        <img
                            src={schoolData.headMaster.photo}
                            alt="Head Master"
                            className="w-24 h-24 rounded-full object-cover mr-4"
                        />
                        <div>
                            <h3 className="text-xl font-semibold">{schoolData.headMaster.name}</h3>
                            {/* Add other head master details if needed */}
                        </div>
                    </div>
                </section>

                {/* Statistics */}
                <section className="bg-white shadow rounded p-6">
                    <h2 className="text-2xl font-bold mb-4">Statistics</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Total Classes/Courses */}
                        <div className="flex items-center space-x-4">
                            <BookOpen className="text-blue-500" size={32} />
                            <div>
                                <h3 className="font-semibold">Total Classes/Courses</h3>
                                <p className="text-gray-700">{schoolData.totalCourses}</p>
                            </div>
                        </div>
                        {/* Total Students */}
                        <div className="flex items-center space-x-4">
                            <Users className="text-green-500" size={32} />
                            <div>
                                <h3 className="font-semibold">Total Students</h3>
                                <p className="text-gray-700">{schoolData.totalStudents}</p>
                            </div>
                        </div>
                        {/* Students per Class/Course */}
                        <div className="flex items-start space-x-4">
                            <ListIcon className="text-purple-500" size={32} />
                            <div>
                                <h3 className="font-semibold">Students per Class/Course</h3>
                                <ul className="text-gray-700">
                                    {schoolData.studentsPerClass.map((cls, index) => (
                                        <li key={index}>
                                            <span className="font-medium">{cls.className}</span>: {cls.count}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        {/* Total Teachers/Lecturers */}
                        <div className="flex items-center space-x-4">
                            <UserIcon className="text-red-500" size={32} />
                            <div>
                                <h3 className="font-semibold">Total Teachers/Lecturers</h3>
                                <p className="text-gray-700">{schoolData.totalTeachers}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;