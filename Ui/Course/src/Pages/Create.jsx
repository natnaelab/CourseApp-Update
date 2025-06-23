import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import "./Update.css";
import Req from "../../Req";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { CircularProgress, Chip, TextField, Autocomplete } from "@mui/material";
import { getUser } from "../UserProfile";
import { useNavigate } from "react-router-dom";
import ReactInputMask from "react-input-mask";
import { transformDurationToMinutes } from "../Utils/durationConvert";
import { put } from '@vercel/blob';
import imageCompression from "browser-image-compression";

const Create = () => {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    resetField,
    formState: { errors },
  } = useForm();

  const [file, setFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [imageLink, setImageLink] = useState("");
  const [grouptypes, setgrouptype] = useState([]);

 

  const navigate = useNavigate();

  const bilingual = watch("bilingual");
  const onlineInPerson = watch("online_in_person");

  async function getGroupTypes() {
    await Req.get("/course/getCourseTypes").then((res) => {
      setgrouptype(res.data);
    });
  }
  useEffect(() => {
    getGroupTypes();
  }, []);

  useEffect(() => {
    if (bilingual === "Bilingual") {
      resetField("level");
    }
  }, [bilingual]);

  useEffect(() => {
    if (onlineInPerson === "Online") {
      resetField("location");
    } else if (onlineInPerson === "In-Person") {
      resetField("zoom_link");
    }
  }, [onlineInPerson]);

  const teachers = watch("teacher") || [];

  const [FormLoading, setFormLoading] = useState(false);

  const [inputValue, setInputValue] = useState("");

  const handleAddChip = () => {
    if (inputValue.trim() !== "") {
      setValue("teacher", [...teachers, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleDeleteChip = (index) => {
    setValue(
      "teacher",
      teachers.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data) => {
    const frequency = `${data.frequencyCount}-${data.frequencyPeriod}`;
    data.frequency = frequency;
    delete data.frequencyCount;
    delete data.frequencyPeriod;

    data.duration = transformDurationToMinutes(data.duration);
    setFormLoading(true);
    try {
      if (typeof data.teacher === "string") {
        data.teacher = data.teacher.split(",").map((t) => t.trim());
      }
      if (!data.maxAge) {
        data.maxAge = 120;
      }
      const token = getUser() && getUser().token;
      await Req.post(`/course/createCourse`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })
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

          setTimeout(() => {
            navigate("/");
          }, 1200);

          setFormLoading(false);
        })
        .catch((err) => {
          setFormLoading(false);
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
        });
    } catch (error) {
      setFormLoading(false);
      toast.error("Error Occured", {
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
    }
  };

  async function uploadImage(file) {
    if (!file) return;

    setFileLoading(true);
    
    const cloudName = import.meta.env.VITE_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_PRESET;

    try {
        // Image compression options
        const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 800,
            useWebWorker: true,
        };

        // Compress the image
        const compressedFile = await imageCompression(file, options);

        // Prepare form data for Cloudinary upload
        const formData = new FormData();
        formData.append("file", compressedFile);
        formData.append("upload_preset", uploadPreset);

        // Upload image to Cloudinary
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        console.log("Uploaded Image URL:", data.secure_url);

        // Set image URL
        setValue("image_link", data.secure_url);
        setImageLink(data.secure_url);

        toast.success("Image uploaded successfully!", {
            position: "top-right",
            autoClose: 3000,
        });

        return data.secure_url;
    } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Error while uploading image", {
            position: "top-right",
            autoClose: 5000,
        });
    } finally {
        setFileLoading(false);
    }
}
  const charLimitValidation = (length) => (value) => {
    if (value.trim().length > length) {
      return `You can only enter up to ${length} characters.`;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    uploadImage(selectedFile);
  };

  return (
    <div className="form-container">
      <h3>Create Course</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>Course Title</label>
          <input
            type="text"
            {...register("course_title", {
              required: "Course title is required",
            })}
          />
          {errors.course_title && (
            <p className="error-message">{errors.course_title.message}</p>
          )}
        </div>
        <div className="form-group age-group">
          <label>Age Group</label>
          <div className="age-inputs">
            <input
              type="number"
              {...register("minAge", { required: "Min Age is required" })}
              placeholder="Min Age"
            />
            <input
              type="number"
              {...register("maxAge")}
              placeholder="Max Age"
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {errors.minAge && (
              <p className="error-message">{errors.minAge.message}</p>
            )}
          </div>
        </div>
        <div className="form-group">
          <label>Bilingual</label>
          <select
            {...register("bilingual", {
              required: "Bilingual selection is required",
            })}
          >
            <option value="">Select...</option>
            <option value="Bilingual">Bilingual</option>
            <option value="Not Bilingual">Not Bilingual</option>
            <option value="Both">Both</option>
          </select>
          {errors.bilingual && (
            <p className="error-message">{errors.bilingual.message}</p>
          )}
        </div>
        {bilingual === "Not Bilingual" && (
          <div className="form-group">
            <label>Level</label>
            <select {...register("level", {})}>
              <option value="">Select...</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        )}
        <div className="form-group">
          <label>Online/In-Person</label>
          <select
            {...register("online_in_person", {
              required: "Online/In-Person selection is required",
            })}
          >
            <option value="">Select...</option>
            <option value="Online">Online</option>
            <option value="In-Person">In-Person</option>
          </select>
          {errors.online_in_person && (
            <p className="error-message">{errors.online_in_person.message}</p>
          )}
        </div>
        {onlineInPerson === "In-Person" && (
          <div className="form-group">
            <label>Location</label>
            <input type="text" {...register("location")} />
          </div>
        )}
        {onlineInPerson === "Online" && (
          <div className="form-group">
            <label>Zoom Link</label>
            <input type="text" {...register("zoom_link")} />
          </div>
        )}
        <div className="form-group">
          <label>Group/Private</label>
          <select
            {...register("group_private", {
              required: "Group/Private selection is required",
            })}
          >
            <option value="">Select...</option>
            <option value="Group">Group</option>
            <option value="Private">Private</option>
          </select>
          {errors.group_private && (
            <p className="error-message">{errors.group_private.message}</p>
          )}
        </div>
        <div className="form-group">
          <label>Day</label>
          <select
            {...register("day", {
              required: "Day selection is required",
            })}
          >
            <option value="">Select...</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>
          {errors.day && <p className="error-message">{errors.day.message}</p>}
        </div>
        <div className="form-group">
          <label>Time</label>
          <input
            type="time"
            {...register("time", { required: "Time is required" })}
          />
          {errors.time && (
            <p className="error-message">{errors.time.message}</p>
          )}
        </div>
        <div className="form-group">
          <label>Duration (HH.MM)</label>

          <Controller
            name="duration"
            control={control}
            rules={{
              required: "Duration is required",
              validate: (value) => {
                const [hours, minutes] = value.split(".").map(Number);
                if (
                  hours >= 0 &&
                  hours <= 23 &&
                  minutes >= 0 &&
                  minutes <= 59
                ) {
                  return true;
                }
                return "Invalid time format. Use HH.MM (e.g., 02.30)";
              },
            }}
            render={({ field }) => (
              <ReactInputMask
                mask="99.99"
                maskChar="_"
                placeholder="HH.MM"
                {...field}
              />
            )}
          />

          {errors.duration && (
            <p className="error-message">{errors.duration.message}</p>
          )}
        </div>
        <div className="form-group">
          <label>Short Description</label>
          <textarea
          maxLength={50}
            {...register("short_description", {
              validate: charLimitValidation(50), // Pass the word limit as argument
            })}
           
          />
          {errors.short_description && (
            <p className="error-message">{errors.short_description.message}</p>
          )}
          <div className="char-count">{watch("short_description")?.length}/50</div>
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea
          maxLength={200}
            {...register("notes", {
              validate: charLimitValidation(200),
            })}
           
          />
          {errors.notes && (
            <p className="error-message">{errors.notes.message}</p>
          )}
          <div className="char-count">{watch("notes")?.length}/200</div>
        </div>
        <div className="form-group">
          <label>Image Link</label>

          <div className="d-flex align-items-center">
            <input
              type="file"
              accept="image/jpeg, image/jpg, image/png"
              onChange={handleFileChange}
            />

            {fileLoading && <CircularProgress size="20px" />}
          </div>

          {/* Display the uploaded image URL */}
          {imageLink && !fileLoading && (
            <div className="mt-3">
              <div
                style={{
                  height: "200px",
                  width: "200px",
                  
                  border: "1px solid #06067a",
                }}
              >
                <img
                  style={{ width: "100%", height: "100%",objectFit:"contain" }}
                  src={imageLink}
                  alt="Image"
                ></img>
              </div>

              <input
                type="text"
                hidden
                value={imageLink}
                {...register("image_link", {
                  required: "Image is required",
                })}
                className="form-control"
                readOnly
              />
            </div>
          )}

          {/* Display validation error message */}
          {errors.image_link && (
            <p className="error-message" style={{ color: "red" }}>
              {errors.image_link.message}
            </p>
          )}
        </div>
        <div className="form-group">
          <label>Link</label>
          <input
            type="text"
            {...register("link", { required: "Link is required" })}
          />
          {errors.link && (
            <p className="error-message">{errors.link.message}</p>
          )}
        </div>
        <div className="form-group">
          <label>Group Type</label>
          <Controller
            name="group_name"
            control={control}
            rules={{ required: "Group Type is required" }}
            render={({ field, fieldState: { error } }) => (
              <Autocomplete
                freeSolo // Allows custom input
                options={grouptypes}
                value={field.value || ""} // Retain input value
                onInputChange={(_, value) => field.onChange(value)} // Update value on typing
                onChange={(_, value) => field.onChange(value)} // Update value on select
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            )}
          />
        </div>
        <div className="form-group">
          <label>Teacher(s)</label>
          <Controller
            name="teacher"
            control={control}
            rules={{ required: "At least one teacher is required" }}
            render={({ field }) => (
              <div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <TextField
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddChip())
                    }
                    placeholder="Add a teacher..."
                    variant="outlined"
                    size="small"
                    style={{ marginRight: 10 }}
                  />
                  <button
                    className="btn btn-sm"
                    type="button"
                    onClick={() => handleAddChip()}
                    style={{
                      height: "100%",
                      backgroundColor: "#06067a",
                      color: "white",
                    }}
                  >
                    Add
                  </button>
                </div>

                <div style={{ marginTop: 10 }}>
                  {field.value?.map((teacher, index) => (
                    <Chip
                      key={index}
                      label={teacher}
                      onDelete={() => handleDeleteChip(index)}
                      style={{ marginRight: 5, marginBottom: 5 }}
                    />
                  ))}
                </div>
              </div>
            )}
          />
          {errors.teacher && (
            <p className="error-message">{errors.teacher.message}</p>
          )}
        </div>
        <div className="form-group">
          <label>Exam</label>
          <input type="text" {...register("exam")} />
        </div>
        <div className="form-group">
          <label>Max Students</label>
          <input type="number" {...register("max_students")} />
        </div>
        <div className="form-group">
          <label>Cost</label>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ marginRight: "10px", fontSize: "25px" }}>£</span>
            <input
              type="text"
              placeholder="Enter cost"
              {...register("cost", {
                min: 0,
                validate: (value) =>
                  /^\d+(\.\d{1,2})?$/.test(value) ||
                  "Only 2 decimal places allowed",
              })}
              onChange={(e) => {
                const { value, selectionStart } = e.target;

                // Allow only numbers and up to 2 decimal places
                const formattedValue = value
                  .replace(/[^0-9.]/g, "")
                  .replace(/(\.\d{2})\d+$/, "$1");

                e.target.value = formattedValue;

                setTimeout(() => {
                  e.target.setSelectionRange(selectionStart, selectionStart);
                }, 0);
              }}
              style={{ flex: 1 }}
            />
          </div>
          {errors.cost && (
            <p className="error-message">{errors.cost.message}</p>
          )}
        </div>

        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label
            style={{ fontSize: "16px", marginBottom: "5px", display: "block" }}
          >
            Frequency
          </label>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {/* Dropdown for Number of Occurrences */}
            <input
              {...register("frequencyCount", {
                required: "Please select a number",
              })}
              style={{
                padding: "8px 12px",
                fontSize: "16px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                backgroundColor: "#f9f9f9",
                cursor: "pointer",
                flex: "1",
              }}
            ></input>

            <span style={{ fontSize: "16px" }}>times per</span>

            {/* Dropdown for Time Period */}
            <select
              {...register("frequencyPeriod", {
                required: "Please select a period",
              })}
              style={{
                padding: "8px 12px",
                fontSize: "16px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                backgroundColor: "#f9f9f9",
                cursor: "pointer",
                flex: "1",
              }}
            >
              <option value="">Select Period</option>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="term">Term</option>
              <option value="year">Year</option>
              <option value="ever">Ever</option>
            </select>
          </div>

          {/* Display Errors if Needed */}
          {errors.frequencyCount && (
            <p style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
              {errors.frequencyCount.message}
            </p>
          )}
          {errors.frequencyPeriod && (
            <p style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
              {errors.frequencyPeriod.message}
            </p>
          )}
        </div>

        <div className="form-group">
          <label>Course Book</label>
          <input type="text" {...register("course_book")} />
        </div>
        <button
          type="submit"
          style={{ backgroundColor: "#06067a", color: "white" }}
        >
          {FormLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              Creating
              <CircularProgress size="20px" sx={{ color: "white" }} />
            </div>
          ) : (
            "Create"
          )}
        </button>
      </form>

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
    </div>
  );
};

export default Create;
