import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import homeService from "../api/homeService";
import {
    BookOpen,
    Users,
    List as ListIcon,
    User as UserIcon,
    School as SchoolIcon,
    AlertCircle,
} from "lucide-react";

const Home = () => {
    const [schoolData, setSchoolData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const result = await homeService.getHomeData();
                
                if (result.success) {
                    setSchoolData(result.data);
                } else {
                    setError(result.message);
                    if (result.requiresSetup) {
                        // Redirect to school setup after 3 seconds
                        setTimeout(() => {
                            navigate('/school');
                        }, 3000);
                    }
                }
            } catch (error) {
                console.error("Error fetching home data:", error);
                setError("Failed to load school data");
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading school data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
                    <AlertCircle className="text-red-500 w-16 h-16 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Data</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    {error.includes("school profile") && (
                        <p className="text-sm text-gray-500">Redirecting to school setup...</p>
                    )}
                </div>
            </div>
        );
    }

    if (!schoolData) {
        return null;
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
                            onError={(e) => {
                                e.target.src = '/placeholder-school.jpg';
                            }}
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
                            onError={(e) => {
                                e.target.src = '/placeholder-user.jpg';
                            }}
                        />
                        <div>
                            <h3 className="text-xl font-semibold">{schoolData.headMaster.name}</h3>
                            {schoolData.headMaster.educationLevel && (
                                <p className="text-gray-600">{schoolData.headMaster.educationLevel}</p>
                            )}
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
                                <p className="text-gray-700 text-2xl">{homeService.formatNumber(schoolData.totalCourses)}</p>
                            </div>
                        </div>
                        {/* Total Students */}
                        <div className="flex items-center space-x-4">
                            <Users className="text-green-500" size={32} />
                            <div>
                                <h3 className="font-semibold">Total Students</h3>
                                <p className="text-gray-700 text-2xl">{homeService.formatNumber(schoolData.totalStudents)}</p>
                            </div>
                        </div>
                        {/* Students per Class/Course */}
                        {schoolData.studentsPerClass.length > 0 && (
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
                        )}
                        {/* Total Teachers/Lecturers */}
                        <div className="flex items-center space-x-4">
                            <UserIcon className="text-red-500" size={32} />
                            <div>
                                <h3 className="font-semibold">Total Teachers/Lecturers</h3>
                                <p className="text-gray-700 text-2xl">{homeService.formatNumber(schoolData.totalTeachers)}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;