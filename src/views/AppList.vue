<template>
  <div class="centered">
    <h2 class="centered">Chat App List</h2>
    <div class="righted">
      <button @click="addApp()">Add App</button>
    </div>
    <table>
      <thead>
        <tr>
          <th width="1">Expand</th>
          <th>Name</th>
          <th>Description</th>
          <th>Temperature</th>
          <th>Max Tokens</th>
          <!-- <th>Top P</th> -->
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(app, index) in apps" :key="index">
          <tr :style="getRowBackgroundColor(index)">
            <td>
              <span @click="toggleExpand(index)">
                <template v-if="!expandedRows[index]">
                  <span>></span>
                </template>
                <template v-else>
                  <span>v</span>
                </template>
              </span>
            </td>
            <td>
              <a href="#" @click.prevent="goToChatGPT(app.name)">{{
                app.name
              }}</a>
            </td>
            <td>{{ app.description }}</td>
            <td>{{ app.temperature }}</td>
            <td>{{ app.max_tokens }}</td>
            <!-- <td>{{ app.top_p }}</td> -->
            <td>
              <button @click="goToChatGPT(app.name)">Chat</button> |
              <button @click="cloneChatGPT(app.name)">Clone</button> |
              <button @click="deleteApp(app.app_id)">Delete</button>
            </td>
          </tr>
          <tr v-if="expandedRows[index]">
            <td colspan="6" class="expanded">
              <div><strong>Welcome:</strong> {{ app.welcome }}</div>
              <div><strong>Data Ground:</strong> {{ app.dataground }}</div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <hr/>
    <div style="color:brown"> {{ errorMsg }}</div>
    <div></div>
  </div>
</template>

<script  lang="ts">
import axios from "axios";
import { defineComponent } from "vue";
// import { useRouter } from "vue-router"; 

interface App {
  app_id: string;
  name: string;
  description: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  welcome: string;
  dataground: string;
};

// const router = useRouter();

export default defineComponent({
  data() {
    return {
      apps: [] as App[],
      expandedRows: {} as Record<number, boolean>,
      errorMsg: "",
    };
  },
  mounted() {
    this.getAppList();
  },
  
  methods: {
    getRowBackgroundColor(index: number) {
      return index % 2 === 0
        ? "background-color: white"
        : "background-color: lightgray";
    },
    toggleExpand(index: number) {
      this.expandedRows[index] = !this.expandedRows[index];
    },
    async getAppList() {
      var that = this;
      try {
        const resp = await axios.get("/api/gptapps/list");
        axios.defaults.headers.common["Authorization"] =
          "Bearer " + resp.data.accessToken;
        this.apps = resp.data;
      } catch (error) {
        console.error("Failed to fetch app list:", error);
        if(error){
          that.errorMsg = error.toString();
        }
      }x
    },
    goToChatGPT(appName: string) {
      // const router = this.$router as Router;
      this.$router.push({ name: "ChatGPT", params: { appName } });
    },
    cloneChatGPT(appName: string) {
      this.$router.push({ name: "CloneGPT", params: { appName } });
    },
    async addApp() {
      this.$router.push({ name: "AddGPT" });

    },
    async deleteApp(app_id: string) {
      try {
        await axios.delete(`/api/gptapps/delete/${app_id}`);
        this.getAppList();
      } catch (error) {
        console.error("Failed to delete app:", error);
      }
    },
  },
});

</script>

<style>
th {
  border: 1px solid #777373;
  padding: 8px;
  background-color: #bbb8b8;
}

.expanded {
  background-color: #f5f5f5;
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
  padding-left: 50px;
}

.centered {
  text-align: center;
  display: block;
}

.righted {
  text-align: right;
  display: block;
}

table {
  border-collapse: collapse;
  width: 100%;
}
</style>
