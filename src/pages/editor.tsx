import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { saveDocumentToDrive, getGoogleDriveFolders } from '../lib/drive';
import styles from '../styles/editor.module.css';

// Dynamically import ReactQuill
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const Editor = () => {
  const { data: session, status } = useSession(); 
  const router = useRouter();
  const [title, setTitle] = useState<string>('Untitled Document');
  const [content, setContent] = useState<string>('');  
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Modal state
  const [newTitle, setNewTitle] = useState<string>(title); // New title for document
  const [selectedFolder, setSelectedFolder] = useState<string>(''); // Selected folder ID
  const [folders, setFolders] = useState<any[]>([]); // State for storing Google Drive folders
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false); // Success state for bubble
  const [isSaving, setIsSaving] = useState<boolean>(false); // Saving state for spinner
  const [folderError, setFolderError] = useState<boolean>(false); // Error state for folder selection

  useEffect(() => {
    if (status === 'loading') {
      return; // Don't do anything until session is loaded
    }

    if (!session) {
      router.push('/'); // Redirect to home if not authenticated
    } else {
      setAccessToken(session?.accessToken || null); // Get the access token from session
    }
  }, [session, router, status]);

  // Fetch Google Drive folders when the modal is opened
  useEffect(() => {
    if (accessToken && isModalOpen) {
      const fetchFolders = async () => {
        try {
          const folders = await getGoogleDriveFolders(accessToken);
          setFolders(folders);
        } catch (error) {
          console.error('Error fetching Google Drive folders:', error);
        }
      };
      fetchFolders();
    }
  }, [isModalOpen, accessToken]);

  const handleSave = () => {
    setNewTitle(title); 
    setIsModalOpen(true); 
    setFolderError(false); 
  };

  const handleModalSave = async () => {
    if (!selectedFolder) {
      setFolderError(true); 
      return; 
    }
    
    setIsSaving(true); // Start the saving process
    if (accessToken && newTitle && selectedFolder) {
      try {
        const documentId = await saveDocumentToDrive(accessToken, newTitle, content, selectedFolder, session?.user?.email || '');
        setUploadSuccess(true); // Show success message
        setTimeout(() => {
          setUploadSuccess(false); // Hide success message after 3 seconds
          router.push('/dashboard'); // Redirect to dashboard
        }, 2000);

        setIsModalOpen(false); // Close the modal after saving
      } catch (error) {
        console.error('Error saving document:', error);
      } finally {
        setIsSaving(false); // Stop the saving process
      }
    }
  };

  const handleFolderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFolder(event.target.value);
    setFolderError(false); // Clear error when folder is selected
  };

  const handleGoBack = () => {
    router.push('/dashboard'); // Redirect to dashboard
  };

  return (
    <div className={styles['editor-container']}>
      <h1>Document Editor</h1>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Document Title"
      />
      <div
        style={{
          width: '8.5in',  // Letter size width
          height: '11in',  // Letter size height
          margin: '0 auto',
          border: '1px solid #ddd',
          padding: '20px',
          boxSizing: 'border-box',
          backgroundColor: 'white',  // Set background color to white
        }}
      >
        <ReactQuill
          value={content}
          onChange={setContent}
          theme="snow"
          style={{ height: '100%', width: '100%' , margin: 0}}
        />
      </div>

      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex' }}>
        <button
          onClick={handleGoBack}
          style={{
            padding: '10px 20px',
            backgroundColor: '#555',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
          }}
        >
          Go Back to Dashboard
        </button>

        <button
          onClick={handleSave}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Save Document
        </button>
      </div>

      {/* Modal for saving */}
      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Save Document</h2>
            <div>
              <label>Title: </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter document title"
              />
            </div>
            <div>
              <label>Choose Folder: </label>
              <select
                value={selectedFolder}
                onChange={handleFolderChange}
              >
                <option value="">Select Folder</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
              {folderError && <p style={{ color: 'red' }}>Please select a folder!</p>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={handleModalSave} disabled={isSaving}>Save</button>
              <button onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Bubble */}
      {uploadSuccess && (
        <div className={styles.successBubble}>
          <span>Document uploaded successfully!</span>
        </div>
      )}

      {/* Saving Indicator */}
      {isSaving && (
        <div className={styles.savingIndicator}>
          <div className={styles.spinner}></div>
          <span>Saving...</span>
        </div>
      )}
    </div>
  );
};

export default Editor;
