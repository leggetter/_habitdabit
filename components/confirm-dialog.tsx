import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";

export const ConfirmDialog = ({
  body,
  isOpen,
  onConfirm,
  onCancel,
}: {
  body: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const { isOpen: isCancelDialogOpen } = useDisclosure({ isOpen });
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  return (
    <AlertDialog
      isOpen={isCancelDialogOpen}
      leastDestructiveRef={cancelRef}
      onClose={onCancel}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogBody>{body}</AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onCancel}>
              No
            </Button>
            <Button colorScheme="red" onClick={onConfirm} ml={3}>
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
