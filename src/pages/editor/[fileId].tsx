import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import styles from '../../styles/editor.module.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const Editor = () => {
  const router = useRouter();
  const { fileId } = router.query;
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    if (!fileId || !session?.user?.email || !session?.accessToken) return;

    const fetchDocument = async () => {
      try {
        const res = await fetch(`/api/file/${fileId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setTitle(data.fileName);
          setContent(data.content);
          setModalTitle(data.fileName);
        } else {
          console.error('Failed to load document:', data.message);
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [fileId, session]);

  const handleSave = () => {
    setModalTitle(title); // Set modal title to current document title
    setIsModalOpen(true);
  };

  const handleModalSave = async () => {
    if (!fileId || !session?.user?.email || !session?.accessToken) return;

    setIsSaving(true);

    try {
      const res = await fetch(`/api/file/${fileId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          fileId,
          fileName: modalTitle,
          content,
          email: session.user.email,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Error saving file:', errorData.message);
      } else {
        console.log('Document saved successfully!');
        setUploadSuccess(true);
        setTimeout(() => {
          setUploadSuccess(false);
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setIsSaving(false);
      setIsModalOpen(false);
    }
  };

  const handleGoBack = () => {
    router.push('/dashboard');
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className={styles['editor-container']}>
      <h1>Editing: {title}</h1>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Document Title"
        className={styles['title-input']}
      />
      <div
        style={{
          width: '8.5in',
          height: '11in',
          margin: '0 auto',
          border: '1px solid #ddd',
          padding: '20px',
          boxSizing: 'border-box',
          backgroundColor: 'white',
        }}
      >
        <ReactQuill value={content} onChange={setContent} theme="snow" style={{ height: '100%', width: '100%', margin: 0 }} />
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
          Save Changes
        </button>
      </div>

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Save Document - {modalTitle}</h2>
            <input
              type="text"
              value={modalTitle}
              onChange={(e) => setModalTitle(e.target.value)}
              placeholder="Document Title"
              className={styles['title-input']}
            />
            <p>Are you sure you want to save this document?</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={handleModalSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {uploadSuccess && (
        <div className={styles.successBubble}>
          <span>Document saved successfully!</span>
        </div>
      )}
    </div>
  );
};

export default Editor;
