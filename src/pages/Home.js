import React, { useContext } from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import { AuthContext } from "../helpers/AuthContext";

function Home() {
  const [listOfPosts, setListOfPosts] = useState([]);
  //유즈스테이트가 데이터를 받아서 왼쪽 것을 변수로 지정하고, 오른쪽 것을 바꿔주면 그 변수 내용이 바뀌는 방식이다.
  const [likedPosts, setLikedPosts] = useState([]);
  const { authState } = useContext(AuthContext);

  let navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
    } else {
      axios
        .get("https://full-stack-api-yohan.herokuapp.com/posts", {
          headers: { accessToken: localStorage.getItem("accessToken") },
        })
        .then((response) => {
          setListOfPosts(response.data.listOfPosts);
          //서버에서 데이터를 받아와서(response) setListOfPost 함수를 사용해서 listOfPosts의 내용으로 바꾸었다.
          setLikedPosts(
            response.data.likedPosts.map((like) => {
              return like.PostId;
            })
          );
        });
    }
  }, []);

  const LikeAPost = (postId) => {
    axios
      .post(
        "https://full-stack-api-yohan.herokuapp.com/likes",
        { PostId: postId }, //PostId를 object로 보내고
        { headers: { accessToken: localStorage.getItem("accessToken") } } //validateToken을 위해 config를 보낸다.
      )
      .then((response) => {
        setListOfPosts(
          listOfPosts.map((post) => {
            if (post.id === postId) {
              if (response.data.liked) {
                return { ...post, Likes: [...post.Likes, 0] }; //이전 post 복사해서, Likes:는 이전 포스트의 Likes 들어가게 0 자리는 그냥 아무 거나 넣어도 됨
              } else {
                const likesArray = post.Likes; //post의 likes를 얻고
                likesArray.pop(); //그 중에 1개 빼고
                return { ...post, Likes: likesArray }; //기존 post 복사 한 후 Likes는 1개 뺀 likesArray가 되도록
              }
            } else {
              return post;
            }
          })
        );

        if (likedPosts.includes(postId)) {
          setLikedPosts(
            likedPosts.filter((id) => {
              return id !== postId;
            })
          );
        } else {
          setLikedPosts([...likedPosts, postId]);
        }
      });
  };

  return (
    <div>
      {listOfPosts.map((value, key) => {
        return (
          <div key={key} className="post">
            <div className="title">{value.title} </div>
            <div
              className="body"
              onClick={() => {
                navigate(`/post/${value.id}`);
              }}
            >
              {value.postText}
            </div>
            <div className="footer">
              <div className="username">
                <Link to={`/profile/${value.UserId}`}>{value.username}</Link>
              </div>
              <div className="buttons">
                <ThumbUpAltIcon
                  onClick={() => {
                    LikeAPost(value.id);
                  }}
                  className={
                    likedPosts.includes(value.id) ? "unlikeBttn" : "likeBttn"
                  }
                />
                <label>{value.Likes.length}</label>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Home;
