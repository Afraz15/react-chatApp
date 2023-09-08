import React from 'react';
import { Text, Avatar, HStack } from '@chakra-ui/react';

function Messages({ text, user = "me", uri }) {
    console.log(uri);
    return (
        <HStack bgColor={"twitter.50"} paddingY={2} paddingX={3} borderRadius={"lg"} alignSelf={user === "me" ? "flex-end" : "flex-start"}>
            {user === "bot" && <Avatar src={uri} />}
            <Text>{text}</Text>
            {user === "me" && <Avatar src={uri} />}
        </HStack>
    );
}

export default Messages;
