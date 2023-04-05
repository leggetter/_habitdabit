import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      h1: {
        marginBottom: 5,
      },
      h2: {
        marginBottom: 5,
      },
      h3: {
        marginBottom: 2,
      },
      p: {
        marginBottom: 2,
      },
      a: {
        color: "green.500",
      },
    },
  },
});

export default theme;
