// import { useState } from "react";
// import axios from "axios";

// const PostUpload = () => {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [file, setFile] = useState(null);

//   const handleUpload = async () => {
//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("description", description);
//     formData.append("file", file);

//     try {
//         await axios.post("http://localhost:5000/api/posts/upload", formData);

//       alert("Post uploaded successfully!");
//     } catch (error) {
//       console.error("Upload error:", error);
//     }
//   };

//   return (
//     <div>
//       <h2>Upload Research Paper</h2>
//       <input type="text" placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
//       <input type="text" placeholder="Description" onChange={(e) => setDescription(e.target.value)} />
//       <input type="file" onChange={(e) => setFile(e.target.files[0])} />
//       <button onClick={handleUpload}>Upload</button>
//     </div>
//   );
// };

// export default PostUpload;


import { useState } from "react";
import axios from "axios";
import "./PostUpload.css"; // You'll need to create this CSS file

const PostUpload = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Determine if it's an image or PDF
      if (selectedFile.type.startsWith('image/')) {
        setFileType('image');
      } else if (selectedFile.type === 'application/pdf') {
        setFileType('pdf');
      } else {
        setError("Only image files and PDFs are allowed!");
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    setLoading(true);
    setError(null);
    
    // Get user ID from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser._id) {
      setError("User session expired. Please log in again.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    
    // Add title and description only for PDF uploads
    if (fileType === 'pdf') {
      if (!title.trim()) {
        setError("Title is required for research papers");
        setLoading(false);
        return;
      }
      formData.append("title", title);
      formData.append("description", description);
    }
    
    // Caption is optional for both types
    formData.append("caption", caption);
    formData.append("userId", storedUser._id);
    
    // File is required
    if (!file) {
      setError("Please select a file to upload");
      setLoading(false);
      return;
    }
    formData.append("file", file);

    try {
      const response = await axios.post("https://social-backend-1-qi8q.onrender.com/api/posts/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Post uploaded successfully!");
      
      // Reset form
      setTitle("");
      setDescription("");
      setCaption("");
      setFile(null);
      setFileType("");
      
      // Optionally, you can redirect or refresh the feed
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.response?.data?.error || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-upload-container">
      <h2>{fileType === 'pdf' ? 'Upload Research Paper' : 'Create Post'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="file-input-container">
        <label htmlFor="file-upload" className="file-upload-label">
          Choose File (Images or PDF)
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="file-input"
        />
        <span className="file-name">
          {file ? file.name : "No file chosen"}
        </span>
      </div>
      
      {fileType === 'pdf' && (
        <>
          <input 
            type="text" 
            placeholder="Paper Title (required)" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="text-input"
          />
          <textarea 
            placeholder="Abstract or Description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            rows="3"
            className="text-area"
          />
        </>
      )}
      
      <textarea 
        placeholder="Caption (optional)" 
        value={caption} 
        onChange={(e) => setCaption(e.target.value)} 
        rows="2"
        className="text-area"
      />
      
      <button 
        onClick={handleUpload} 
        disabled={loading || !file} 
        className="upload-button"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default PostUpload;
