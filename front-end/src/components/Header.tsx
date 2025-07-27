import {
  Input,
  Flex,
  Box,
  Text,
  HStack,
  Image,
} from "@chakra-ui/react";
import searchIcon from "../resources/search-normal.png";
import admin from "../resources/admin2.png";
import { useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/reviewsGrid":
        return "Reviews";
      case "/keywords":
        return "Keywords";
      case "/reviewsList":
        return "Todo Items";
      case "/Admin":
        return "Admin page";
      default:
        return "Dashboard";
    }
  };

  return (
    <Flex
      width={{
        base: "calc(100% - 24px)",
        sm: "calc(100% - 24px)",
        md: "calc(100% - 30px)",
        lg: "calc(100% - 30px)",



      }}
      height="51px"
      overflow="hidden"
      position="relative"
      align="center"
      gap = {{base:"10px",sm:"10px",md:"20px",lg:"30px"}}
    >
      <Box flex="1" >
        <HStack align="center" width="100%"  justifyContent = "space-between">
          <Text
            font="inter"
            fontWeight={600}
            color = "white"
            display = {{base:"none", sm:"block",md:"block",lg:"block" }}
            fontSize={{ base: "0px", sm: "28px", md: "30px", lg: "32px" }}
            lineHeight="160%"
          >
            {getPageTitle()}
          </Text>
          {/* Search Bar */}
          <Box position="relative" flex="1" maxW="491px" minW="160px">
            <Input
              placeholder="Search"
              border="none"
              font="inter"
              fontSize="16px"
              borderRadius="10px"
              bg="white"
              h="50px"
              pr="40px"
              _focus={{ boxShadow: "none" }}
              borderBottom="2px solid"
              borderBottomColor="gray.300"
              width="100%"
            />
            <Box
              position="absolute"
              right="10px"
              top="50%"
              transform="translateY(-50%)"
              pointerEvents="none"
            >
              <Image src={searchIcon} boxSize="20px" />
            </Box>
          </Box>
        </HStack>
      </Box>

      {/* Admin Section */}
      <Flex align="center" ml="auto"  display = "flex">
        <Image src={admin} boxSize="48px" align = "center" justifySelf = "center" />
      </Flex>
    </Flex>
  );
}
