import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../App.css';

const api = axios.create({
    baseURL: 'http://localhost:8080',
});

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
                    new Map(res.data.map((c) => [c.class_name, c])).values()
                );
                setCourses(uniqueCourses);
            })
            .catch(() => setError('Αποτυχία φόρτωσης μαθημάτων'));
    }, []);

    return (
        <div className="container mx-auto px-4 py-6">
            <h2 className="text-2xl font-bold mb-4">📚 Τα Μαθήματά Μου</h2>

            {error && <p className="text-red-600">{error}</p>}

            <ul className="list-disc pl-6 space-y-2">
                {courses.map((course, index) => (
                    <li key={index}>
                        {course.class_name} ({course.semester}) –{' '}
                        {course.finalized ? 'FINAL' : 'OPEN'}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Courses;
