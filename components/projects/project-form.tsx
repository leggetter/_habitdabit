import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { Project } from "../../db/models/project";
import { ProjectValues } from "../../lib/project-helpers";

interface ProjectFormProps {
  action: string;
  method: "POST" | "PATCH";
  project?: ProjectValues;
  onSubmitComplete: (project: Project) => void;
}

export default function ProjectForm({
  action,
  method,
  project,
  onSubmitComplete,
}: ProjectFormProps) {
  const projectValues = project ?? new ProjectValues();

  return (
    <Box as="section" mt={10}>
      <VStack maxW={600} spacing={5} align="stretch">
        <Formik
          initialValues={projectValues}
          onSubmit={async (
            values: ProjectValues,
            { setSubmitting }: FormikHelpers<ProjectValues>
          ) => {
            const params: RequestInit = {
              headers: {
                "Content-Type": "application/json",
              },
              method: method,
              body: JSON.stringify(values),
            };

            const response = await fetch(action, params);
            const body = (await response.json()) as Project;

            setSubmitting(false);

            onSubmitComplete(body);
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
  );
}
