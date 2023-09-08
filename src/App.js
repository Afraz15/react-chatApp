import {
  Box,
  Button,
  Container,
  HStack,
  Input,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import Messages from "./Components/Messages";
import {
  onAuthStateChanged,
  getAuth,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { app } from "./firebase";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [bot, setBot] = useState(false);

  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (data) => {
      setUser(data);
      // console.log(data); // Use data instead of user
    });

    const messageCollectionRef = query(
      collection(db, "Messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribeMessages = onSnapshot(messageCollectionRef, (snap) => {
      setMessages(
        snap.docs.map((doc) => {
          const id = doc.id;
          return { id, ...doc.data() };
        })
      );
      // console.log(
      //   snap.docs.map((doc) => {
      //     const id = doc.id;
      //     return { id, ...doc.data() };
      //   })
      // );
    });

    return () => {
      unsubscribe(); // Clean up the authentication listener on unmount
      unsubscribeMessages(); // Clean up the Firestore listener on unmount
    };
  }, []); // Empty dependency array since you want it to run once on mount

  const anonymousLoginHandler = () => {
    signInAnonymously(auth)
      .then((userCredential) => {
        const user = userCredential.user;
        // console.log(user);
      })
      .catch((error) => {
        alert("Error signing in anonymously:", error);
      });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "Messages"), {
        text: message,
        uid: user.uid,
        uri: user.photoURL,
        createdAt: serverTimestamp(),
      });
      setMessage("");
      if (bot) {
        setTimeout(() => {
          addDoc(collection(db, "Messages"), {
            text: `Hello, I am a bot with no Intelect yet so I don't know how to answer "${message}" `,
            uid: "bot",
            uri: "data:image/png;base64,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",
            createdAt: serverTimestamp(),
          });
        }, 800);
      }
      divScroll.current.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      // console.log(error);
    }
  };

  const googleLoginHandler = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((userCredential) => {
        const user = userCredential.user;
        // console.log(user);
      })
      .catch((error) => {
        alert("Error signing in with Google:", error);
      });
  };

  const divScroll = useRef(null);

  const logOutHandler = () => signOut(auth);


  return (
    <Box bg={"gray.400"}>
      {user ? (
        <Container h={"100vh"} bg={"whiteAlpha.600"} borderRadius={5}>
          <VStack h={"full"}>
            <Button onClick={logOutHandler} w={"full"} colorScheme={"red"}>
              Log Out
            </Button>
            {user ? (
              <p>Welcome, {user.displayName || "Anonymous User"}!</p>
            ) : (
              <p>You are not logged in.</p>
            )}
            <VStack
              h="full"
              w={"full"}
              overflowY="auto"
              css={{ "&::-webkit-scrollbar": { display: "none" } }}
            >
              {messages.map((item) => (
                <Messages
                  key={item.id}
                  text={item.text}
                  user={item.uid === user?.uid ? "me" : "bot"} // Note: user?.uid
                  uri={item.uri}
                />
              ))}
              <div ref={divScroll}></div>
            </VStack>
            <form
              style={{
                width: "100%",
                marginBottom: "0.5rem",
              }}
            >
              <HStack w={"full"}>
                <Input
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                  }}
                  placeholder="Type your Message Here..."
                />
                <Button
                  type="submit"
                  onClick={submitHandler}
                  colorScheme={"blackAlpha"}
                >
                  Submit
                </Button>
                <Button
                  colorScheme={bot ? "green" : "red"}
                  title="Bot Enable / Disable"
                  onClick={() => {
                    setBot(!bot);
                  }}
                >
                  Bot
                </Button>
              </HStack>
            </form>
          </VStack>
        </Container>
      ) : (
        <VStack h={"100vh"} justifyContent={"center"}>
          <Button onClick={anonymousLoginHandler} colorScheme={"green"}>
            Log In Anonymously
          </Button>
          <Button onClick={googleLoginHandler} colorScheme={"green"}>
            Google Login
          </Button>
        </VStack>
      )}
    </Box>
  );
}

export default App;
