import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Bounce, ToastContainer, toast } from "react-toastify";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Req from "../../Req";
import { getUser } from "../UserProfile";

const Upload = () => {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [File, setFile] = useState(null);
  const navigate = useNavigate();

  const handleFileUpload = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (File) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        jsonData.forEach((course) => {
          if (course.time) {
            course.time = convertExcelTimeToHHmm(course.time);
          }
          if (course.teacher) {
            course.teacher = course.teacher.split(",");
          }
          if(course.age){
            const parts = course.age.toString().split("-").map(Number);
            course.minAge = parts[0];
            course.maxAge = parts.length > 1 ? parts[1] : parts[0];
            delete course.age;
          }
          
        });



        if (jsonData && jsonData.length > 0) {
          try {
            // Retrieve token from localStorage or via getUser()
            const token = getUser() && getUser().token;

            const response = await Req.post("/course/save", jsonData, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
            });

            if (response.status == 200) {
              toast.success(response.data.message, {
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
              setFile(null);
              setTimeout(() => {
                navigate("/");
              }, 1500);
            } else {
              toast.error("Failed to upload file. Please try again.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
              });
            }
          } catch (error) {
            console.error("Error uploading file:", error);
            toast.error("An error occurred while uploading the file.", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
          }
        } else {
          toast.error("No valid data found in the file.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        }
        setLoading(false);
      };

      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        setLoading(false);
        toast.error("Error reading the file. Please try again.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      };

      reader.readAsArrayBuffer(File);
    } else {
      setLoading(false);
      toast.error("No file selected. Please choose a file to upload.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  const convertExcelTimeToHHmm = (excelTime) => {
    if (typeof excelTime === "number") {
      const totalMinutes = excelTime * 1440;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.floor(totalMinutes % 60);
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
    }
    return excelTime;
  };

  const handleExport = async () => {
    setExportLoading(true);
    await Req.get("/course/getAllCourse")
      .then((res) => {
        if (res.status === 200) {
          const wb = XLSX.utils.book_new();
          const processedData = res.data.map((item) => {
            const { _id, __v, ...rest } = item;
            if (rest.teacher && Array.isArray(rest.teacher)) {
              rest.teacher = rest.teacher.join(", ");
            }
            if(rest.minAge && rest.maxAge){
              rest.age = `${rest.minAge}-${rest.maxAge}`

              delete rest.minAge
              delete rest.maxAge
            }
            return rest;
          });
          const ws = XLSX.utils.json_to_sheet(processedData);
          XLSX.utils.book_append_sheet(wb, ws, "Courses");
          XLSX.writeFile(wb, "courses_data.xlsx");
          setExportLoading(false);
          toast.success("File Exported Successfully", {
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
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error Exporting file.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setExportLoading(false);
      });
  };

  return (
    <div>
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
      <a
        href="/Sample.xlsx"
        download="Sample.xlsx"
        className="p-3"
       
        style={{ display: "flex", gap: "5px" ,color:"#06067a"}}
      >
        <h5>Sample File Format Download</h5>
        <FileCopyIcon style={{ cursor: "pointer" }} color="primary" />
      </a>
      <div
        className="container"
        style={{ display: "flex", justifyContent: "center", width: "100%" }}
      >
        <div className="row w-100 mt-4">
          <div className="w-100">
            <form onSubmit={handleFileUpload}>
              <div
                className="form-group files"
                style={{ display: "flex", justifyContent: "center" }}
              >
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setFile(e.target.files[0])}
                  accept=".xlsx, .xls"
                />
              </div>
              <button type="submit" className="btn btn-block w-100"  style={{backgroundColor:"#06067a",color:"white"}}>
                {loading ? (
                  <CircularProgress size="25px" sx={{ color: "white" }} />
                ) : (
                  "Upload"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      <div
        className="p-3 mt-5"
        style={{ display: "flex", gap: "5px", alignItems: "center" }}
      >
        <h5>Export Database</h5>
        <button onClick={handleExport} type="button" className="btn btn-sm"   style={{backgroundColor:"#06067a",color:"white"}}>
          {exportLoading ? (
            <CircularProgress size="25px" sx={{ color: "white" }} />
          ) : (
            "Export"
          )}
        </button>
      </div>
    </div>
  );
};

export default Upload;
