import React, { useEffect, useState, useContext } from "react";
import images from '../../assets/img/def.jpg';
import axios from 'axios';

import Style from '../Profile/Style.module.css'
import { useDropzone } from 'react-dropzone';
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from "./../../Componant/Header/Header";
import UserContext from "../../context/Usercontext";
import { useNavigate } from "react-router-dom";
// import { Buffer } from "buffer";
import { useLocation } from "react-router-dom";
import api from "../../api/API";

function Profile() {
    const navigate = useNavigate();
    const { loginUser } = useContext(UserContext);

    let initialData = {
        name: "",
        email: "",
        image: images,
        userName: "",
        skills: [],
        links: []
    };

    // const [user, setUser] = useState({})
    const { user } = useContext(UserContext);

    console.log('user : ', user)

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const fromSettings = queryParams.get("fromSettings") === "true";

    const defTeams = location?.state?.teams
    // Fix: Ensure teams is always an array
    const [teams, setTeams] = useState(Array.isArray(defTeams) ? defTeams : []) 
    console.log('defTeams : ', defTeams)
    // const [isUserUpdated, setIsUserUpdated] = useState(false);

    const [profileData, setProfileData] = useState(initialData);
    const [edit, setEdit] = useState(false);
    const [editdata, setEditdata] = useState(profileData);
    const [doneS, setDoneS] = useState(false);
    const [doneL, setDoneL] = useState(false);
    const [urlErr, setUrlErr] = useState(false)
    const [skill, setSkill] = useState(false)
    const [link, setLink] = useState(false)
    const [imagePreview, setImagePreview] = useState(images);
    const [selectedImageFile, setSelectedImageFile] = useState(null); // Add this state


    useEffect(() => {
        if (!user) navigate("/login");
        console.log({ user })

    }, [user, navigate]);


    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                console.log("Token from localStorage:", token);


                const response = await axios.get(`${api}/profile/me`, {
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    }
                });

                console.log("Profile Response:", response.data);
                console.log("Profile Response:", response.data.img);


                if (response.data.profile) {
                    const profileData = response.data.profile;
                    const formattedData = {
                        name: profileData.name || "",
                        email: profileData.email || "",
                        userName: profileData.userName || "",
                        image: profileData.img || images,
                        skills: Array.isArray(profileData.skills) ? profileData.skills : [],
                        links: Array.isArray(profileData.links) ? profileData.links : []
                    };
                    
                    // Fix: Better handling of teams data
                    if (Array.isArray(teams)) {
                        if (teams.length === 0) {
                            console.log("teams is an empty array, setting from profile data.");
                            // Ensure profileData.teams is an array before setting
                            setTeams(Array.isArray(profileData.teams) ? profileData.teams : []);
                        } else {
                            console.log("teams is an array with elements.");
                        }
                    } else {
                        console.log("teams is not an array, setting from profile data.");
                        setTeams(Array.isArray(profileData.teams) ? profileData.teams : []);
                    }

                    setProfileData(formattedData);
                    setEditdata(formattedData);

                    if (profileData.img) {
                        setImagePreview(profileData.img);
                    }

                    loginUser(profileData);
                }
            } catch (error) {
                console.error("Profile fetch error:", error);

                if (error.response?.status === 401) {
                    console.log("Unauthorized - clearing auth data");
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login");
                } else {
                    console.log("Error fetching profile:", error.message);
                }
            }
        };

        fetchProfile();
    }, [navigate]);



    const handleSave = async () => {
        setEdit(false);
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("No token found. Redirect to login.");
            return;
        }

        try {
            // Create FormData to handle file upload
            const formData = new FormData();
            
            // Add text fields
            formData.append('name', editdata.name);
            formData.append('userName', editdata.userName);
            formData.append('email', editdata.email);
            formData.append('links', editdata.links);
            formData.append('skills', editdata.skills);
            
            // Add image file if a new one was selected
            if (selectedImageFile) {
                formData.append('img', selectedImageFile);
            }

            const response = await axios.put(
                `${api}/profile/me/editProfile`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `${token}`,
                    },
                }
            );

            if (response.data) {
                console.log("Updated Profile Data:", response.data);
                setProfileData((prev) => ({
                    ...prev,
                    ...editdata,
                }));
                localStorage.setItem("user", JSON.stringify(editdata));
                // Clear the selected file after successful upload
                setSelectedImageFile(null);
            }
        } catch (err) {
            console.error("Error saving profile:", err);
        }
    };

    //profile image

    console.log('teams : ', teams)

    const onDrop = (acceptedFiles) => {
        // Preview the uploaded image
        const file = acceptedFiles[0];
        if (file) {
            const previewURL = URL.createObjectURL(file);
            setImagePreview(previewURL);
            setSelectedImageFile(file); // Store the actual file
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: "image/*",
        maxFiles: 1,
    });

    // for editing name & mail
    const handleInputChange = (field, value) => {
        setEditdata((prev) => ({ ...prev, [field]: value }));
    };
    // add link or skill
    const handleAddItem = (arrayName, newItem) => {
        if (!newItem || editdata[arrayName].includes(newItem)) return;
        setEditdata((prev) => ({
            ...prev,
            [arrayName]: [...prev[arrayName], newItem],
        }));
    };




    // check the validation of the url
    const isValidUrl = (url) => {
        const regex = new RegExp("^https?:\\/\\/.+$")
        return regex.test(url);
    };

    // delete some link or skill

    const handleDeleteItem = (arrayName, itemToDelete) => {
        setEditdata((prev) => ({
            ...prev,
            [arrayName]: prev[arrayName].filter((item) => item !== itemToDelete),
        }));
    };

    
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const editParam = queryParams.get("edit");
        if (editParam === "true") {
            setEdit(true);
        }
    }, [location.search]);


    return (
        <>
            {!fromSettings && <Header />}
            <div className={Style.profile}>


                <div className={Style.prof}>

                    <div
                        {...getRootProps()}
                    >
                        {/* if the edit button is active and the upload window is not the icon for camera is shown */}
                        <input {...getInputProps()} />
                        {!isDragActive && edit && (
                            <div className={Style.camera}>
                                <i className="bi bi-camera-fill"></i>
                            </div>
                        )}
                    </div>
                    {/* profile div */}
                    {imagePreview && (
                        <div >

                            <img
                                src={imagePreview}
                                alt="Profile Preview"
                                className={Style.img_prof}
                            />
                        </div>
                    )}
                </div>

                {/* imag_prof_div */}


                {/*/////////////////// Name ///////////////////////////////*/}
                <div className={Style.inf}>
                    {!edit ? (
                        <>
                            <div className={Style.name}>
                                <h4>Name</h4>
                                <div className={Style.text_bar}>
                                    <h5>{profileData?.name || "No name set"}</h5>
                                </div>
                            </div>

                        </>
                    ) : (
                        <>
                            <input
                                className={Style.input}
                                type="text"
                                value={editdata.name}
                                onChange={(e) => {
                                    handleInputChange("name", e.target.value)

                                }}
                            />
                        </>
                    )}

                    {/* ///////////////////////Code////////////////////// */}
                    {!edit ? (
                        <>
                            <div className={Style.code}>
                                <h4>Username</h4>
                                <div className={Style.text_bar}>
                                    <h5>{profileData?.userName || "No username set"}</h5>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <input
                                className={Style.input}
                                type="text"
                                value={editdata.userName}
                                onChange={(e) => {
                                    handleInputChange("userName", e.target.value)

                                }}
                            />
                        </>
                    )}

                    {/* //////////////////Email//////////////////// */}
                    {!edit ? (
                        <>
                            <div className={Style.mail}>
                                <h4>Email</h4>
                                <div className={Style.text_bar}>
                                    <h5>{profileData?.email || "No email set"}</h5>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <input
                                className={Style.input}
                                type="text"
                                value={editdata.email}
                                onChange={(e) => {
                                    handleInputChange("email", e.target.value)

                                }}
                            />
                        </>
                    )}
                </div>
                {/* inf div */}
                
                {/* ///////////////////Teams////////////////// */}
                <div className={Style.skills}>
                    <h4>Teams</h4>
                    {/* Fix: Ensure teams is an array before using .map() */}
                    {Array.isArray(teams) && teams.length > 0 ? (
                        <ul>
                            {teams.map((team, index) => (
                                <div key={index} className={Style.cell}>
                                    <li>{team.teamName}</li>
                                </div>
                            ))}
                        </ul>
                    ) : (
                        <div className={Style.text_bar}>
                            <h5>No teams yet</h5>
                        </div>
                    )}
                </div>

                {/* ///////////////////Skills////////////////// */}
                <div className={Style.skills}>
                    <h4>Skills</h4>
                    {!edit ? (
                       <ul>
                            {profileData.skills?.map((str, index) => (
                                <div key={index} className={Style.cell}>
                                <li>{str}</li>
                                </div>
                            ))}
                        </ul>

                    ) : (
                        <>
                            <ul>
                                {editdata.skills?.map((str, index) => (
                                    <div className={Style.cell}>
                                        <li key={index}>
                                            {str}
                                            <button className={Style.del_btn} onClick={() => handleDeleteItem("skills", str)}>
                                                <i className="bi bi-x-lg"></i>
                                            </button>
                                        </li>
                                    </div>
                                ))}
                            </ul>
                            {!skill &&
                                (<button className={Style.add_btn} onClick={() => setSkill(true)}>
                                    <i className="bi bi-plus"></i>
                                </button>)
                            }
                            {skill && (
                                <div className={Style.menuWrapper}>
                                    <input
                                        className={Style.input}
                                        type="text"
                                        placeholder="New Skill..."
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && e.target.value.trim() !== "") {
                                                handleAddItem("skills", e.target.value.trim())
                                                setDoneS(true)
                                                e.target.value = ""
                                            } else if (e.key === "Enter") {
                                                setDoneS(false)
                                                setSkill(false)
                                            }

                                        }}
                                    />
                                    <div className={Style.hintMenu}>Click enter to add</div>


                                </div>

                            )}
                            {doneS && (
                                <i className="bi bi-check"></i>
                            )}

                        </>
                    )}

                </div>

                {/* //////////////////////////////////////Links//////////////////////////////////// */}
                <div className={Style.links}>
                    <h4>Links</h4>
                    {!edit ? (
                        <ul>
                            {profileData.links?.map((str, index) => (
                                <div className={Style.cell}>
                                    <li key={index}>{str}</li>

                                </div>
                            ))}

                        </ul>
                    ) : (
                        <>

                            <ul>
                                {editdata.links?.map((str, index) => (
                                    <div className={Style.cell}>
                                        <li key={index}>{str}
                                            <button className={Style.del_btn} onClick={() => handleDeleteItem("links", str)}>
                                                <i className="bi bi-x-lg"></i>
                                            </button>
                                        </li>

                                    </div>
                                ))}

                            </ul>
                            {!link && (
                                <button className={Style.add_btn} onClick={() => setLink(true)}>
                                    <i className="bi bi-plus"></i>
                                </button>
                            )}
                            {link && (
                                <div className={Style.menuWrapper}>

                                    <input
                                        className={Style.input}
                                        type="url"
                                        placeholder="https://....."
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && e.target.value.trim() !== "" && isValidUrl(e.target.value.trim())) {
                                                handleAddItem("links", e.target.value.trim())
                                                setDoneL(true)
                                                e.target.value = ""

                                            }
                                            else if (e.key === "Enter" && !isValidUrl(e.target.value.trim()) && e.target.value.trim() !== "") {
                                                setUrlErr(true)
                                                e.target.value = ""
                                                setDoneL(false);
                                            }
                                            else if (e.key === "Enter") {
                                                setLink(false)
                                                setDoneL(false)
                                                setUrlErr(false)
                                            }
                                        }}
                                    />

                                    <div className={Style.hintMenu}>Click enter to add</div>

                                </div>
                            )}

                            {doneL && (
                                <i className="bi bi-check"></i>
                            )}
                            {urlErr && (<p className={Style.Err}>Not valid url!</p>)}

                        </>
                    )}

                </div>

                {/* Save Button */}
                {edit ? (

                    <button onClick={handleSave} className={Style.save_btn}>Save</button>

                ) : (
                    <button onClick={() => setEdit(true)} className={Style.edit_btn}>
                        <i className="bi bi-pencil-square"></i>
                    </button>
                )}
            </div>
        </>
    );
}

export default Profile;