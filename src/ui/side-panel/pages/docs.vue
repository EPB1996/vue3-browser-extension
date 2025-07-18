<template>
  <div>
    <h1>Docs Page</h1>
    <UButton
      variant="solid"
      @click="() => createDocViaCloudFuntion()"
    >
      Create doc via cloud function
    </UButton>
  </div>
</template>

<script>
const createDocViaCloudFunction = () => {
  fetch("http://192.168.1.125:8080", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "New Document",
      content: "This is a new document created via cloud function.",
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Document created:", data)
    })
    .catch((error) => {
      console.error("Error creating document:", error)
    })
}
</script>

<style scoped></style>
