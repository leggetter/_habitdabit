import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import AccessDenied from "../../../components/access-denied";
import Layout from "../../../components/layout";
import { Field, Form, Formik, FormikHelpers } from "formik";

interface CreateProjectValues {
  name: string;
  goal: string;
  owner: string;
  champion: string;
}

export default function CreateProject() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading as="h1">Create Project</Heading>

      <Box as="section" mt={10}>
        <VStack maxW={600} spacing={5} align="stretch">
          <Formik
            initialValues={{
              name: "",
              goal: "",
              owner: session.user.email,
              champion: "",
            }}
            onSubmit={async (
              values: CreateProjectValues,
              { setSubmitting }: FormikHelpers<CreateProjectValues>
            ) => {
              const params: RequestInit = {
                headers: {
                  "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify(values),
              };

              const response = await fetch("/api/v1/projects", params);
              const body = await response.json();

              alert(JSON.stringify(body, null, 2));
              setSubmitting(false);
            }}
          >
            <Form>
              <Field id="name" name="name">
                {({ field, form }: { field: any; form: any }) => (
                  <FormControl isRequired mb={5}>
                    <FormLabel>Name</FormLabel>
                    <Input {...field} type="text" />
                    <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>

              <Field id="goal" name="goal">
                {({ field, form }: { field: any; form: any }) => (
                  <FormControl id="goal" isRequired mb={5}>
                    <FormLabel>Goal</FormLabel>
                    <Textarea {...field} />
                    <FormErrorMessage>{form.errors.goal}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>

              <Field id="owner" name="owner">
                {({ field, form }: { field: any; form: any }) => (
                  <FormControl isRequired mb={5}>
                    <FormLabel>Owner</FormLabel>
                    <Input {...field} type="email" isReadOnly />
                    <FormHelperText>
                      The person who creates the Project is the owner.
                    </FormHelperText>
                  </FormControl>
                )}
              </Field>

              <Field id="champion" name="champion">
                {({ field, form }: { field: any; form: any }) => (
                  <FormControl id="champion" isRequired mb={5}>
                    <FormLabel>Champion</FormLabel>
                    <Input {...field} type="email" />
                    <FormErrorMessage>{form.errors.champion}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>

              <FormControl textAlign="right">
                <Button variant="solid" colorScheme="blue" type="submit">
                  Submit
                </Button>
              </FormControl>
            </Form>
          </Formik>
        </VStack>
      </Box>
    </Layout>
  );
}
