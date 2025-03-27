import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'loading') return; // Avoid fetching until session is loaded

    if (!session?.user?.email) {
      router.push('/'); 
      return;
    }

    const fetchFiles = async () => {
      try {
        const res = await fetch(`/api/files?emailId=${session.user.email}`);
        const data = await res.json();
        setFiles(data);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, [session, status, router]);

  const handleCreateNewDocument = () => {
    router.push('/editor'); // Redirect to a new editor page to create a new document
  };

  const handleLogout = () => {
    signOut(); // Log the user out
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Welcome, {session?.user?.email}</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      <div>
        <button
          onClick={handleCreateNewDocument}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          Create New Document
        </button>
      </div>

      <h2 style={{ marginTop: '30px' }}>Your Documents</h2>
      {files.length === 0 ? (
        <p>No documents found. Create a new one!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {files.map((file) => (
            <div
              key={file._id}
              style={{
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <a
                href={`editor/${file.fileId}`}
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#3f51b5',
                  textDecoration: 'none',
                }}
              >
                {file.fileName}
              </a>
              <span style={{ fontSize: '14px', color: '#777' }}>
                {new Date(file.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
