import style from './style.module.css';
import { useDropzone } from 'react-dropzone';
import React, { useState, useContext } from "react";
import images from '../../assets/img/def.jpg';

import { ReactComponent as Cross } from './../../assets/svgs/Cross.svg';
import { ReactComponent as Profile } from './../../assets/svgs/menu/profile.svg';
import UserContext from "../../context/Usercontext";
import { useNavigate } from "react-router-dom";
import SetPost from '../../servies/Posts/setPost';

function CreatePost({ communityCode, fetchPosts }) {
    const [imagePreview, setImagePreview] = useState(images);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    // for the post publish 
    const [postContent, setPostContent] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [postImage, setPostImage] = useState(null); // Store actual file object
    const [postFile, setPostFile] = useState(null); // Store actual file object

    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            const previewURL = URL.createObjectURL(file);
            setImagePreview(previewURL);
            
            // Check if it's an image or other file type
            if (file.type.startsWith('image/')) {
                setPostImage(file); // Store the actual file object
                setPostFile(null);
            } else {
                setPostFile(file); // Store as file if not image
                setPostImage(null);
                setImagePreview(images); // Reset image preview for non-images
            }
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            // Add more file types as needed
        },
        maxFiles: 1,
    });

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    const handlePostSubmit = async () => {
        console.log("Submitting post with:", {
            content: postContent,
            imageFile: postImage?.name || "No image",
            file: postFile?.name || "No file",
            code_Comm: communityCode
        });
        
        await SetPost({
            content: postContent,
            imageFile: postImage, // Pass actual file object
            file: postFile, // Pass actual file object
            code_Comm: communityCode,
            setPostContent,
            setShowModal,
            navigate,
            fetchPosts
        });
        
        // Reset the form
        setPostContent("");
        setImagePreview(images);
        setPostImage(null);
        setPostFile(null);
    };

    const removeFile = () => {
        setImagePreview(images);
        setPostImage(null);
        setPostFile(null);
    };

    return (
        <>
            {/* Create post area */}
            <div className={style.createPostArea}>
                <div className={style.Post_id}>
                    <Profile className={style.icon} />
                    <input
                        className={style.input_post}
                        onClick={toggleModal}
                        placeholder={`What's on your mind, ${user?.name || "User"}?`}
                        readOnly
                    />
                </div>
            </div>

            {/* Create post modal */}
            {showModal && (
                <div className={style.modalOverlay}>
                    <div className={style.modalContent}>
                        <div className={style.modalHeader}>
                            <p>Create Post</p>
                            <div className={style.top}>
                                <Cross className={style.cross} onClick={toggleModal} />
                            </div>
                        </div>
                        <hr />

                        <div className={style.model_content}>
                            <div className={style.userInfo}>
                                <Profile className={style.photo} />
                                <div>
                                    <p>{user?.name || "Unknown User"}</p>
                                    <p>{new Date().toLocaleString()}</p>
                                </div>
                            </div>

                            <textarea
                                className={style.input_model}
                                placeholder={`What's on your mind, ${user?.name || "User"}?`}
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                            ></textarea>

                            <div className={style.imageUploadArea} {...getRootProps()}>
                                <input {...getInputProps()} />
                                <div className={style.addToPost}>
                                    <p>Add to your post</p>
                                    <div className={style.uploadIcons}>
                                        <div className={style.iconWrapper}>
                                            <i className={style.photoIcon} />
                                            <span>Photo/File</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Image Preview */}
                            {imagePreview && imagePreview !== images && (
                                <div className={style.previewContainer}>
                                    <img src={imagePreview} alt="Preview" className={style.imagePreview} />
                                    <button className={style.removeImage} onClick={removeFile}>
                                        ✕
                                    </button>
                                </div>
                            )}

                            {/* File Preview (for non-images) */}
                            {postFile && (
                                <div className={style.previewContainer}>
                                    <div className={style.filePreview}>
                                        <span>📁 {postFile.name}</span>
                                        <button className={style.removeImage} onClick={removeFile}>
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            className={style.registerBtn}
                            onClick={handlePostSubmit}
                            disabled={!postContent.trim() && !postImage && !postFile}
                        >
                            Post
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default CreatePost;