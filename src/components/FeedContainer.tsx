import { useState, useEffect } from 'react';
import { IonApp, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonInput, IonLabel, IonModal, IonFooter, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonAlert, IonText, IonAvatar, IonCol, IonGrid, IonRow, IonIcon, IonPopover } from '@ionic/react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';
import { colorFill, pencil, trash } from 'ionicons/icons';
import { heart, heartOutline } from 'ionicons/icons';

interface Post {
  post_id: string;
  user_id: number;
  username: string;
  avatar_url: string;
  post_content: string;
  post_created_at: string;
  post_updated_at: string;
  likes: number;
  comments?: Comment[];
}

interface Comment {
  comment_id: string;
  post_id: string;
  user_id: number;
  username: string;
  comment_content: string;
  comment_created_at: string;
}

const FeedContainer = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [postContent, setPostContent] = useState('');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [popoverState, setPopoverState] = useState<{ open: boolean; event: Event | null; postId: string | null }>({ open: false, event: null, postId: null });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.email?.endsWith('@nbsc.edu.ph')) {
        setUser(authData.user);
        const { data: userData, error } = await supabase
          .from('users')
          .select('user_id, username, user_avatar_url')
          .eq('user_email', authData.user.email)
          .single();
        if (!error && userData) {
          setUser({ ...authData.user, id: userData.user_id });
          setUsername(userData.username);
        }
      }
    };
    const fetchPosts = async () => {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*, comments(*), likes(count)')
        .order('post_created_at', { ascending: false });
    
      if (!postsError && postsData) {
        const updatedPosts = postsData.map(post => ({
          ...post,
          likes: post.likes?.count || 0, // Ensure likes is initialized to 0 if undefined
        }));
        setPosts(updatedPosts as Post[]);
      }
    };
  
    fetchUser();
    fetchPosts();
  }, []);

  const addComment = async (post_id: string, commentContent: string) => {
    if (!user || !commentContent) return;
  
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id,
          user_id: user.id,
          username: username,
          comment_content: commentContent,
        },
      ])
      .select('*');
  
    if (!error && data) {
      // Update the local state
      const updatedPosts = posts.map(post =>
        post.post_id === post_id
          ? { ...post, comments: [...(post.comments || []), data[0]] }
          : post
      );
      setPosts(updatedPosts);
    }
  };
  const deleteComment = async (comment_id: string, post_id: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .match({ comment_id });
  
    if (!error) {
      // Update the local state
      const updatedPosts = posts.map(post =>
        post.post_id === post_id
          ? { ...post, comments: post.comments?.filter(comment => comment.comment_id !== comment_id) }
          : post
      );
      setPosts(updatedPosts);
    }
  };
  const incrementLikes = async (post_id: string) => {
    if (!user) return; // Ensure the user is logged in
  
    // Check if the user already liked the post
    const { data: existingLike, error: likeError } = await supabase
      .from('likes')
      .select('*')
      .eq('post_id', post_id)
      .eq('user_id', user.id)
      .single();
  
    if (likeError && likeError.code !== 'PGRST116') {
      console.error('Error checking like:', likeError);
      return;
    }
  
    const postIndex = posts.findIndex(post => post.post_id === post_id);
    if (postIndex === -1) return;
  
    const post = posts[postIndex];
    const currentLikes = post.likes || 0; // Ensure likes is a valid number
  
    if (existingLike) {
      // Unlike the post
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .match({ post_id, user_id: user.id });
  
      if (!deleteError) {
        // Update the local state
        const updatedPosts = [...posts];
        updatedPosts[postIndex] = { ...post, likes: Math.max(currentLikes - 1, 0) }; // Prevent negative likes
        setPosts(updatedPosts);
      }
    } else {
      // Like the post
      const { error: insertError } = await supabase
        .from('likes')
        .insert([{ post_id, user_id: user.id }]);
  
      if (!insertError) {
        // Update the local state
        const updatedPosts = [...posts];
        updatedPosts[postIndex] = { ...post, likes: currentLikes + 1 };
        setPosts(updatedPosts);
      }
    }
  };
  const createPost = async () => {
    if (!postContent || !user || !username) return;
  
    // Fetch avatar URL
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_avatar_url')
      .eq('user_id', user.id)
      .single();
  
    if (userError) {
      console.error('Error fetching user avatar:', userError);
      return;
    }
  
    const avatarUrl = userData?.user_avatar_url || 'https://ionicframework.com/docs/img/demos/avatar.svg';
  
    // Insert post with avatar URL
    const { data, error } = await supabase
      .from('posts')
      .insert([
        { post_content: postContent, user_id: user.id, username, avatar_url: avatarUrl }
      ])
      .select('*');
  
    if (!error && data) {
      setPosts([data[0] as Post, ...posts]);
    }
  
    setPostContent('');
  };

  const deletePost = async (post_id: string) => {
    await supabase.from('posts').delete().match({ post_id });
    setPosts(posts.filter(post => post.post_id !== post_id));
  };

  const startEditingPost = (post: Post) => {
    setEditingPost(post);
    setPostContent(post.post_content);
    setIsModalOpen(true);
  };

  const savePost = async () => {
    if (!postContent || !editingPost) return;
    const { data, error } = await supabase
      .from('posts')
      .update({ post_content: postContent })
      .match({ post_id: editingPost.post_id })
      .select('*');
    if (!error && data) {
      const updatedPost = data[0] as Post;
      setPosts(posts.map(post => (post.post_id === updatedPost.post_id ? updatedPost : post)));
      setPostContent('');
      setEditingPost(null);
      setIsModalOpen(false);
      setIsAlertOpen(true);
    }
  };

  return (
    <>
        <IonContent>
            <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: 'url(https://static.vecteezy.com/system/resources/previews/006/786/021/non_2x/seashell-seamless-pattern-summer-holiday-marine-background-underwater-ornamental-textured-sketching-wallpaper-with-sea-shells-sea-star-and-sand-vector.jpg)',
              backgroundRepeat: 'repeat',
              backgroundSize: 'cover',
              zIndex: -1,
            }}
            ></div>
          {user ? (
            <>
            <IonCard style={{ marginTop: '4rem', borderRadius: '10px', backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
                <IonCardHeader>
                    <IonCardTitle style={{color: "white"}}>Create Post</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                    <IonInput value={postContent} onIonChange={e => setPostContent(e.detail.value!)} placeholder="Write a post..." />
                </IonCardContent>
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.5rem' }}>
                    <IonButton onClick={createPost}>Post</IonButton>
                </div>
            </IonCard>

              {posts.map(post => (
                <IonCard key={post.post_id} style={{ marginTop: '2rem', marginBottom: '2rem', borderRadius: '10px', backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
                <IonCardHeader>
                  <IonRow>
                    <IonCol size="1.85">
                      <IonAvatar>
                        <img alt={post.username} src={post.avatar_url} />
                      </IonAvatar>
                    </IonCol>
                    <IonCol>
                      <IonCardTitle style={{ marginTop: '10px', color: "white"}}>{post.username}</IonCardTitle>
                      <IonCardSubtitle>{new Date(post.post_created_at).toLocaleString()}</IonCardSubtitle>
                    </IonCol>
                    <IonCol size="auto">
                      {/* Pencil icon triggers popover */}
                      <IonButton
                        fill="clear"
                        onClick={(e) => setPopoverState({ open: true, event: e.nativeEvent, postId: post.post_id })}
                      >
                        <IonIcon color="secondary" icon={pencil} />
                      </IonButton>
                    </IonCol>
                  </IonRow>
                </IonCardHeader>
              
                <IonCardContent>
                  <IonText style={{ color: 'white' }}>
                    <h1>{post.post_content}</h1>
                  </IonText>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                      <IonButton
                        fill="clear"
                        onClick={() => incrementLikes(post.post_id)}
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <IonIcon
                          icon={post.likes > 0 ? heart : heartOutline}
                          color={post.likes > 0 ? 'danger' : 'medium'}
                          style={{ fontSize: '20px', marginRight: '5px' }}
                        />
                        <IonText style={{ color: 'white' }}>{post.likes || 0}</IonText>
                      </IonButton>
                    </div>


                    <div style={{ marginTop: '20px' }}>
  <IonText style={{ fontWeight: 'bold', color: 'white' }}>Comments:</IonText>
  {post.comments?.map(comment => (
    <div key={comment.comment_id} style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
      <IonText style={{ fontWeight: 'bold', color: 'white' }}>{comment.username}:</IonText>
      <IonText style={{ marginLeft: '10px', color: 'white' }}>{comment.comment_content}</IonText>
      <IonButton
        fill="clear"
        color="danger"
        onClick={() => deleteComment(comment.comment_id, post.post_id)}
        style={{ marginLeft: 'auto' }}
      >
        Delete
      </IonButton>
    </div>
  ))}
  <IonInput
    placeholder="Write a comment..."
    onIonChange={e => setPostContent(e.detail.value!)}
    style={{ marginTop: '10px' }}
  />
  <IonButton
    onClick={() => addComment(post.post_id, postContent)}
    style={{ marginTop: '10px' }}
  >
    Add Comment
  </IonButton>
</div>
                  </IonCardContent>
                
                {/* Popover with Edit and Delete options */}
                <IonPopover
                  style={{ borderRadius: '25px' }}
                  isOpen={popoverState.open && popoverState.postId === post.post_id}
                  event={popoverState.event}
                  onDidDismiss={() => setPopoverState({ open: false, event: null, postId: null })}
                >
                  <IonButton fill="clear" onClick={() => { startEditingPost(post); setPopoverState({ open: false, event: null, postId: null }); }}>
                    Edit
                  </IonButton>
                  <IonButton fill="clear" color="danger" onClick={() => { deletePost(post.post_id); setPopoverState({ open: false, event: null, postId: null }); }}>
                    Delete
                  </IonButton>
                </IonPopover>
              </IonCard>
              ))}
            </>
          ) : (
            <IonLabel>Loading...</IonLabel>
          )}
        </IonContent>

        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Edit Post</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonInput value={postContent} onIonChange={e => setPostContent(e.detail.value!)} placeholder="Edit your post..." />
          </IonContent>
          <IonFooter>
            <IonButton onClick={savePost}>Save</IonButton>
            <IonButton onClick={() => setIsModalOpen(false)}>Cancel</IonButton>
          </IonFooter>
        </IonModal>

        <IonAlert
          isOpen={isAlertOpen}
          onDidDismiss={() => setIsAlertOpen(false)}
          header="Success"
          message="Post updated successfully!"
          buttons={['OK']}
        />
      </>
  );
};

export default FeedContainer;