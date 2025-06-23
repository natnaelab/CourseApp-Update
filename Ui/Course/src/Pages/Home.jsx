import React, { useState, useEffect } from "react";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "./Home.css";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import { CircularProgress, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { getUser } from "../UserProfile";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import Req from "../../Req";
import { Link, useNavigate } from "react-router-dom";
import { convertMinutesToDurationInWords } from "../Utils/durationConvert";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";

const CourseTable = () => {
  const [courses, setCourses] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [TotalCourseFilter, setTotalCourseFilter] = useState(0);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    ageRange: "",
    onlineInPerson: "Don't Mind",
    groupPrivate: "Don't Mind",
    day: "Don't Mind",
    startTime: "",
    endTime: "",
    bilingual: "Don't Mind",
    level: "Don't Mind",
    location: "",
    sortBy: "cost",
    sortOrder: "asc",
  });
  const [loading, setLoading] = useState(false);
  const [location, setlocation] = useState([]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await Req.get("/course", {
        params: {
          ...filters,
          page: currentPage,
          limit: 10,
        },
      });
      console.log(response);
      setCourses(response.data.courses);
      setTotalPages(response.data.totalPages);
      setTotalCourseFilter(response.data.totalCourses);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    setLoading(true);
    await Req.get("/course/getLocations")
      .then((res) => {
        setlocation(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    // Reset location if not in-person and level if not bilingual/not needed
    if (
      filters.onlineInPerson === "Online" ||
      filters.onlineInPerson === "Don't Mind"
    ) {
      filters.location = "";
    }
    if (
      filters.bilingual === "Bilingual" ||
      filters.bilingual === "Don't Mind"
    ) {
      filters.level = "";
    }
    fetchCourses();
    if (filters.onlineInPerson === "In-Person") {
      fetchLocations();
    }
  }, [filters, currentPage]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handlePaginationChange = (page) => {
    setCurrentPage(page);
  };

  const toggleSortOrder = (attribute) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      sortBy: attribute,
      sortOrder: prevFilters.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  // Modified handleDelete function that includes the Authorization header
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this course?"
    );
    if (isConfirmed) {
      setLoading(true);
      const token = getUser() && getUser().token;

      await Req.delete(`/course/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })
        .then((res) => {
          fetchCourses();
          toast.success(res.data, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
          });
        })
        .catch((err) => {
          setLoading(false);
          toast.error("Error Deleting Course.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        });
    }
  };

  const handleDuplicateCourse = async (course) => {
    setLoading(true);
    const token = getUser() && getUser().token;
    await Req.post(
      "/course/duplicateCourse",
      course,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => {
        toast.success(res.data.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
        fetchCourses()
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err.response.data.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "50vh",
          }}
        >
          <CircularProgress size="50px" sx={{ color: "blue" }} />
        </div>
      ) : (
        <div style={{ width: "100%", padding: "15px 20px 15px 20px" }}>
          <div className="d-flex align-items-center justify-content-between">
            <h1 className="mb-4">Course List</h1>
            <Link to="/create">
              <button
                className="btn"
                style={{ backgroundColor: "#06067a", color: "white" }}
              >
                Create Course
              </button>
            </Link>
          </div>

          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <select
              name="ageRange"
              onChange={handleFilterChange}
              className="form-control-sm-sm-sm-sm-sm"
              value={filters.ageRange}
            >
              <option value="">Select Age Range</option>
              <option value="18-25">18 - 25</option>
              <option value="26-35">26 - 35</option>
              <option value="36-45">36 - 45</option>
              <option value="46-60">46 - 60</option>
              <option value="60">Greater than 60</option>
            </select>

            <select
              name="onlineInPerson"
              className="form-control-sm-sm-sm-sm"
              onChange={handleFilterChange}
              value={filters.onlineInPerson}
            >
              <option value="Don't Mind">Online/In-person (Don't Mind)</option>
              <option value="Online">Online</option>
              <option value="In-Person">In-person</option>
            </select>

            {filters.onlineInPerson === "In-Person" && (
              <select
                name="location"
                className="form-control-sm-sm-sm-sm"
                onChange={handleFilterChange}
                value={filters.location}
              >
                <option value="Don't Mind">Location (Don't Mind)</option>
                {location.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            )}

            <select
              name="groupPrivate"
              className="form-control-sm-sm-sm-sm"
              onChange={handleFilterChange}
              value={filters.groupPrivate}
            >
              <option value="Don't Mind">Group/Private (Don't Mind)</option>
              <option value="Group">Group</option>
              <option value="Private">Private</option>
            </select>

            <select
              name="day"
              onChange={handleFilterChange}
              className="form-control-sm-sm-sm-sm"
              value={filters.day}
            >
              <option value="Don't Mind">Day (Don't Mind)</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>

            <input
              type="time"
              className="form-control-sm-sm-sm-sm"
              name="startTime"
              placeholder="Start time"
              onChange={handleFilterChange}
              value={filters.startTime}
            />
            <input
              type="time"
              placeholder="End time"
              className="form-control-sm-sm-sm-sm"
              name="endTime"
              onChange={handleFilterChange}
              value={filters.endTime}
            />

            <select
              name="bilingual"
              onChange={handleFilterChange}
              className="form-control-sm-sm-sm-sm"
              value={filters.bilingual}
            >
              <option value="Don't Mind">Ability (Any)</option>
              <option value="Bilingual">Bilingual</option>
              <option value="Not Bilingual">Not bilingual</option>
            </select>

            {filters.bilingual === "Not Bilingual" && (
              <select
                className="form-control-sm-sm-sm-sm"
                name="level"
                onChange={handleFilterChange}
                value={filters.level}
              >
                <option value="Don't Mind">Select Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            )}

            {/* Sorting Section */}
            <select
              onChange={handleFilterChange}
              name="sortBy"
              className="form-control-sm-sm-sm-sm"
              value={filters.sortBy}
            >
              <option value="cost">Sort by Cost</option>
              <option value="Dates">Sort by Dates</option>
              <option value="Duration">Sort by Duration</option>
            </select>
            <button
              className="btn"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#06067a",
                color: "white",
              }}
              onClick={() => toggleSortOrder(filters.sortBy)}
            >
              {filters.sortOrder === "asc" ? (
                <KeyboardDoubleArrowUpIcon />
              ) : (
                <KeyboardDoubleArrowDownIcon />
              )}
            </button>
          </div>
          <div style={{ display: "flex", justifySelf: "flex-end" }}>
            Total Results: {TotalCourseFilter}
          </div>
          {/* Table Section */}
          <div style={{ overflowX: "auto" }}>
            <table className="table align-middle mb-0 bg-white w-100">
              <thead className="bg-light">
                <tr>
                  <th>Image</th>
                  <th>Course Title</th>
                  <th>Age Group</th>
                  <th>Short Description</th>
                  <th>Bilingual</th>
                  <th>Level</th>
                  <th>Mode</th>
                  <th>Group/Private</th>
                  <th>Day and Time</th>
                  <th>Location</th>
                  <th>Duration</th>
                  <th>Cost</th>
                  <th>View More</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={course.image_link}
                          alt="Course Image"
                          style={{
                            width: "45px",
                            height: "45px",
                            objectFit: "contain",
                          }}
                          className="rounded-circle"
                        />
                      </div>
                    </td>
                    <td>{course.course_title}</td>
                    <td>{course.minAge + "-" + course.maxAge}</td>
                    <td>
                      <Tooltip
                        sx={{ fontSize: "20px" }}
                        title={course.short_description}
                      >
                        {course.short_description.split(" ").length > 10
                          ? course.short_description
                              .split(" ")
                              .slice(0, 10)
                              .join(" ") + "..."
                          : course.short_description}
                      </Tooltip>
                    </td>
                    <td>{course.bilingual}</td>
                    <td>{course.level}</td>
                    <td>{course.online_in_person}</td>
                    <td>{course.group_private}</td>
                    <td>{`${course.day} at ${course.time}`}</td>
                    <td>{course.location}</td>
                    <td>{convertMinutesToDurationInWords(course.duration)}</td>
                    <td>{course.cost}</td>
                    <td>
                      <a
                        href={course.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View More
                      </a>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <Tooltip title="Delete course">
                          <DeleteIcon
                            onClick={() => handleDelete(course._id)}
                            style={{ color: "red", cursor: "pointer" }}
                          />
                        </Tooltip>

                        <Tooltip title="Edit course">
                          <ModeEditIcon
                            onClick={() => navigate(`/update/${course._id}`)}
                            style={{ color: "green", cursor: "pointer" }}
                          />
                        </Tooltip>

                        <Tooltip title="Duplicate course">
                          <FolderCopyIcon
                            onClick={() => handleDuplicateCourse(course)}
                            style={{ color: "blue", cursor: "pointer" }}
                          />
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Section */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
              gap: "10px",
            }}
          >
            <button
              className="btn"
              style={{ backgroundColor: "#06067a", color: "white" }}
              onClick={() => handlePaginationChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              style={{ backgroundColor: "#06067a", color: "white" }}
              className="btn btn-primary"
              onClick={() => handlePaginationChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </>
  );
};

export default CourseTable;
