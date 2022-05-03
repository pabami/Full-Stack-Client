import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";

function Post() {
  let { id } = useParams();
  //주소창의 /이후 입력한 정보가 id로 나온다.
  const [postObject, setPostObject] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const { authState } = useContext(AuthContext);

  let navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:3001/posts/byId/${id}`).then((response) => {
      setPostObject(response.data);
    });
    axios.get(`http://localhost:3001/comments/${id}`).then((response) => {
      //이렇게 서버에서 해당 아이디와 포함된 모든 comments를 가져온다.
      setComments(response.data);
      //위에 useState 사용해서 가져온 data(response.data)를 comments로 만들다. var comments = response.data 같은 것임
    });
  }, []);
  //여기에 [] 이거 안 넣으면 계속 api request를 할 것이다.

  const addComment = () => {
    axios
      .post(
        "http://localhost:3001/comments",
        {
          commentBody: newComment,
          PostId: id,
        },
        {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
            //sessionStorage에서 토큰 정보를 가져와서 header에 넣는다.
          },
        }
      )
      .then((response) => {
        if (response.data.error) {
          // console.log(response.data.error);
          // alert(response.data.error);
        } else {
          const commentToAdd = {
            commentBody: newComment,
            username: response.data.username,
          };
          setComments([...comments, commentToAdd]);

          //...comments 하면 이전 comments 밑에 commentToAdd를 추가하고, 화면에 나타낸다.
          setNewComment("");
        }
      });
  };

  const deleteComment = (id) => {
    axios
      .delete(`http://localhost:3001/comments/${id}`, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then(() => {
        setComments(
          comments.filter((val) => {
            return val.id !== id;
          })
        );
      });
  };

  const deletePost = (id) => {
    axios
      .delete(`http://localhost:3001/posts/${id}`, {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then(() => {
        navigate("/");
      });
  };

  const editPost = (option) => {
    if (option === "title") {
      let newTitle = prompt("Enter New Title");
      //prompt에 기록한 것이 newTitle이란 변수에 저장된다.
      axios.put(
        "http://localhost:3001/posts/title",
        { newTitle: newTitle, id: id },
        {
          headers: { accessToken: localStorage.getItem("accessToken") },
        }
      );
      setPostObject({ ...postObject, title: newTitle });
    } else {
      let newPostText = prompt("Enter New Text");
      axios.put(
        "http://localhost:3001/posts/postText",
        { newText: newPostText, id: id },
        {
          headers: { accessToken: localStorage.getItem("accessToken") },
        }
      );
      setPostObject({ ...postObject, postText: newPostText });
    }
  };
  return (
    <div className="postPage">
      <div className="leftSide">
        <div className="post" id="individual">
          <div
            className="title"
            onClick={() => {
              if (authState.username === postObject.username) {
                editPost("title");
              }
            }}
          >
            {postObject.title}
          </div>
          <div
            className="body"
            onClick={() => {
              if (authState.username === postObject.username) {
                editPost("body");
              }
            }}
          >
            {postObject.postText}
          </div>
          <div className="footer">
            {postObject.username}{" "}
            {authState.username === postObject.username && (
              <button
                onClick={() => {
                  deletePost(postObject.id);
                }}
              >
                Delete Post
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="rightSide">
        <div className="addCommentContainer">
          <input
            type="text"
            placeholder="Comment..."
            autoComplete="off"
            value={newComment} //newComment를 넣어두면 input안에 넣은 것이 newComment가 되니까 그 모양 그대로인데 addComment에 setNewComment("") 해두면 add하나 후에 comment를 ""로 바꾸어 주고 그것이 value에 바로 적용되서 여기도 "" 된다.
            onChange={(event) => {
              setNewComment(event.target.value);
            }}
          />
          <button onClick={addComment}>Add Comment</button>
        </div>
        <div className="listOfComments">
          {comments.map((comment, key) => {
            return (
              <div key={key} className="comment">
                {comment.commentBody}
                <label>Username: {comment.username}</label>
                {authState.username === comment.username && (
                  <button
                    onClick={() => {
                      deleteComment(comment.id);
                    }}
                  >
                    X
                  </button>
                )}
              </div>
            );
            // key={key} 해주는 건 그냥 warning 없애려는 거다. 안 해도 된다.
          })}
        </div>
      </div>
    </div>
  );
}

export default Post;
