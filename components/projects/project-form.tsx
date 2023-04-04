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
import { Field, Form, Formik, FormikHelpers, useFormikContext } from "formik";
import { useState } from "react";
import { Project } from "../../db/models/project";
import { ProjectValues } from "../../lib/project-helpers";

interface ProjectFormProps {
  action: string;
  method: "POST" | "PATCH";
  project?: ProjectValues;
  onSubmitComplete: (project: Project) => Promise<void>;
  championReadonly?: boolean;
}

const AdminEmails = () => {
  const { values, setFieldValue } = useFormikContext<ProjectValues>();

  const addAdminEmail = () => {
    values.adminEmails!.push("");
    setFieldValue("adminEmails", values.adminEmails);
  };

  const removeAdminEmail = (index: number) => {
    values.adminEmails!.splice(index, 1);
    setFieldValue("adminEmails", values.adminEmails);
  };
  return (
    <Box>
      <FormLabel>Admins</FormLabel>
      {values.adminEmails?.map((value, i) => {
        return (
          <Box key={`adminEmails_${i}`}>
            <Field id={`adminEmails[${i}]`} name={`adminEmails[${i}]`}>
              {({ field, form }: { field: any; form: any }) => (
                <FormControl isRequired mb={5}>
                  <Box display="flex" flexDirection="row">
                    <Input {...field} type="email" />
                    {/* <FormHelperText>
                          The administrators of the project.
                        </FormHelperText> */}
                    <Button
                      ml={5}
                      onClick={() => {
                        removeAdminEmail(i);
                      }}
                    >
                      -
                    </Button>
                  </Box>
                </FormControl>
              )}
            </Field>

            {values.adminEmails === undefined ||
              (i === values.adminEmails?.length - 1 && (
                <Box display="flex" justifyContent="flex-end" mb={10}>
                  <Button
                    onClick={() => {
                      addAdminEmail();
                    }}
                  >
                    +
                  </Button>
                </Box>
              ))}
          </Box>
        );
      })}
    </Box>
  );
};

export default function ProjectForm({
  action,
  method,
  project,
  onSubmitComplete,
  championReadonly = false,
}: ProjectFormProps) {
  const _projectValues = new ProjectValues(project);
  if (_projectValues.name === undefined) _projectValues.name = "";
  if (_projectValues.champion === undefined) _projectValues.champion = "";

  const [projectValues, setProjectValues] =
    useState<ProjectValues>(_projectValues);

  const validateForm = (values: ProjectValues) => {
    const errors: { name?: string; owner?: string; adminEmails?: string } = {};

    // if(!values.adminEmails) {
    //   errors.adminEmails = 'Required'
    // }
    // else {

    // }

    // if (!values.owner) {
    //   errors.owner = 'Required';
    // }

    return errors;
  };

  return (
    <Box as="section" mt={10}>
      <VStack maxW={600} spacing={5} align="stretch">
        <Formik
          initialValues={projectValues}
          validate={validateForm}
          onSubmit={async (
            values: ProjectValues,
            { setSubmitting }: FormikHelpers<ProjectValues>
          ) => {
            setSubmitting(true);

            const params: RequestInit = {
              headers: {
                "Content-Type": "application/json",
              },
              method: method,
              body: JSON.stringify(values),
            };

            try {
              const response = await fetch(action, params);
              const body = (await response.json()) as Project;
              await onSubmitComplete(body);
              setSubmitting(false);
            } catch (err) {
              // TODO: have some form-level errors
              console.error(err);
              setSubmitting(false);
            }
          }}
        >
          {(props) => (
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

              <Field id="champion" name="champion">
                {({ field, form }: { field: any; form: any }) => (
                  <FormControl
                    id="champion"
                    isRequired
                    isReadOnly={championReadonly}
                    mb={5}
                  >
                    <FormLabel>Champion</FormLabel>
                    <Input {...field} type="email" />
                    <FormErrorMessage>{form.errors.champion}</FormErrorMessage>
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

              <AdminEmails />

              <FormControl textAlign="right">
                <Button
                  variant="solid"
                  colorScheme="blue"
                  type="submit"
                  isLoading={props.isSubmitting}
                >
                  Submit
                </Button>
              </FormControl>
            </Form>
          )}
        </Formik>
      </VStack>
    </Box>
  );
}
