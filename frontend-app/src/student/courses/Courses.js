import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../App.css';

import { apiGateway,gradesService} from '../../services/apiClients'


const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const id = localStorage.getItem('student_id');
        if (!id) {
            setError('Δεν βρέθηκε student_id. Κάνε ξανά login.');
            return;
        }

        api
            .get(`/grades/student/${id}`, {
                headers: {
                    'x-user-email': localStorage.getItem('email'),
                    'x-user-role': localStorage.getItem('role') || 'student',
                },
            })
            .then((res) => {
                const uniqueCourses = Array.from(
                    new Map(res.data.map((c) => [`${c.class_name}-${c.semester}`, c])).values()
                );
                setCourses(uniqueCourses);
            })
            .catch(() => setError('Αποτυχία φόρτωσης μαθημάτων'));
    }, []);

    return (
        <div className="page-container">
            <h2 className="page-title text-white-force">My Courses 📚 </h2>

            {error && <p className="text-red-600">{error}</p>}

            <table className="table-base">
                <thead>
                    <tr>
                        <th>Course</th>
                        <th>Semester</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map((course, index) => (
                        <tr key={index}>
                            <td>{course.class_name}</td>
                            <td>{course.semester}</td>
                            <td>{course.finalized ? 'FINAL' : 'OPEN'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Courses;
