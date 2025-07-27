import { Text, TextProps, useBreakpointValue} from "@chakra-ui/react"

export const ListTitleText = (props: TextProps) => (
  <Text
    color = "#161819"
    font = "inter"
    fontWeight={500}
    fontSize={{ base: "10px", sm: "12px", md: "12px", lg: "16px" }}
    whiteSpace="nowrap"
    letterSpacing="0"
    overflow="hidden"
    textOverflow="ellipsis"
    lineHeight="160%"
    {...props}
  />
)

export const ListButtonText = (props: TextProps) => (
  <Text
    color = "#FFFFFF"
    font = "inter"
    fontWeight={500}
    fontSize={{ base: "10px", sm: "10px", md: "14px", lg: "14px" }}
    whiteSpace="nowrap"
    letterSpacing="0"
    lineHeight="160%"
    {...props}
  />
)

export const TileText = (props: TextProps) => (
  <Text
    color = "#161819"
    font = "inter"
    fontWeight={500}
    fontSize={{ base: "16px", sm: "12px", md: "12px", lg: "16px" }}
    whiteSpace="nowrap"
    letterSpacing="0"
    overflow="hidden"
    textOverflow="ellipsis"
    lineHeight="160%"
    {...props}
  />
)

export const LinkText = (props: TextProps) => (
  <Text
    color = "#161819"
    font = "inter"
    fontWeight={400}
    fontSize="12px"
    whiteSpace="nowrap"
    letterSpacing="0"
    overflow="hidden"
    textOverflow="ellipsis"
    lineHeight="160%"
    opacity="60%"
    {...props}
  />
)
export const DashboardText = (props: TextProps) => (
  <Text
    color = "#161819"
    font = "inter"
    fontWeight={400}
    fontSize={{ base: '13px', md: '13px', lg: '16px' }}
    whiteSpace="nowrap"
    letterSpacing="0"
    textOverflow="ellipsis"
    lineHeight="160%"
    opacity="60%"
    {...props}
  />
)


export const ListLinkText = (props: TextProps) => (
  <Text
    color = "#161819"
    font = "inter"
    fontWeight={400}
    fontSize={{ base: '8px', md: '11px', lg: '11px' }}
    letterSpacing="0"
    overflow="hidden"
    textOverflow="ellipsis"
    lineHeight="160%"
    opacity="60%"
    whiteSpace="nowrap"
    {...props}
  />
)

export const GridLinkText = (props: TextProps) => (
  <Text
    color = "#161819"
    font = "inter"
    fontWeight={400}
    fontSize={{ base: '8px', md: '11px', lg: '11px' }}
    letterSpacing="0"
    overflow="hidden"
    textOverflow="ellipsis"
    lineHeight="160%"
    opacity="60%"
    whiteSpace="nowrap"
    {...props}
  />
)

export const NotificationText = (props: TextProps) => (
  <Text
    color = "#161819"
    font = "inter"
    fontWeight={400}
    fontSize="16px"
    whiteSpace="nowrap"
    letterSpacing="0"
    overflow="hidden"
    textOverflow="ellipsis"
    lineHeight="160%"
    {...props}
  />
)

export const NameText = (props: TextProps) => (
  <Text
    color = "#161819"
    font = "inter"
    fontWeight={500}
    fontSize="12px"
    whiteSpace="nowrap"
    letterSpacing="0"
    {...props}
  />
)

export const BarButtonText = (props: TextProps) => (
  <Text
    font = "inter"
    fontWeight={400}
    fontSize="16px"
    lineHeight = "160%"
    letterSpacing="0"
    white-space = "normal"
    {...props}
 /> 
)

export const NumberText = (props: TextProps) => (
  <Text
    font = "inter"
    fontWeight={600}
    fontSize="40px"
    whiteSpace="nowrap"
    lineHeight="120%"
    letterSpacing="0"
    {...props}
  />
)

export const SubText = (props: TextProps) => (
  <Text
    font="inter"
    fontWeight={400}
    color="#5C5C5C"
    fontSize="10px"
    lineHeight="160%"
    textAlign="left"
    whiteSpace="nowrap"
    letterSpacing="0"
    {...props}
  />
)


export const ListingText = (props: TextProps) => {
  const text = props.children as string
  const displayText = useBreakpointValue({
    md: text, 
    base: text, 
    sm:text,
    lg:text,
  //  lg:text?.match(/\d{4}$/)?.[0] || text,
  })

  return (
    <Text
      fontFamily="Inter"
      fontWeight={500}
      color="#161819"
      fontSize={{ base: "14px", sm: "14px", md: "14px", lg: "14px" }}
      lineHeight="160%"
      textAlign="right"
      letterSpacing="0"
      opacity="60%"
      whiteSpace="nowrap"
      {...props}
    >
      {displayText}
    </Text>
  )
}


export const BoxText = (props: TextProps) => (
    <Text
      font="inter"
      fontWeight="500"
      color="#161819"
      fontSize={{ base: "14px", sm: "14px", md: "16px", lg: "18px" }}
      lineHeight="160%"
      textAlign="left"
      whiteSpace="nowrap"
      {...props}
    />
)

export const NotificationsView = (props: TextProps) => (
  <Text
    font="inter"
    fontWeight="400"
    opacity = "50%"
    color="#161819"
    fontSize="14px"
    lineHeight="160%"
    textAlign="right"
    whiteSpace="nowrap"
    overflow="hidden"
    letterSpacing="0"
    {...props}
  />
)

export const ViewAllText = (props: TextProps) => (
  <Text
    font="inter"
    fontWeight="500"
    color="#161819"
    fontSize="14px"
    lineHeight="160%"
    textAlign="right"
    whiteSpace="nowrap"
    letterSpacing="0"
    overflow="hidden"
    {...props}
  />
)

export const DateText = (props: TextProps) => (
  <Text
    font="inter"
    fontWeight={400}
    color="#161819"
    fontSize="14px"
    lineHeight="160%"
    textAlign="left"
    letterSpacing="0"
    opacity="50%"
    whiteSpace="nowrap"
    textOverflow="ellipsis"
    {...props}
  />
)