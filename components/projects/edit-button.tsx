import HDLinkButton from "../hd-link-button";

export default function EditButton({ id }: { id: number }) {
  return (
    <HDLinkButton
      href={`/dashboard/projects/${id}/edit`}
      variant="solid"
      colorScheme="blue"
    >
      Edit
    </HDLinkButton>
  );
}
