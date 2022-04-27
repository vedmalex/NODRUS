<template>
  <div><div id="vk_comments"></div></div>
</template>

<script>
import { injectVKOpenApi, initVK } from "./vkinit.js";

export default {
  name: "vk-comments",
  props: {},
  mounted() {
    injectVKOpenApi()
      .then(initVK(true))
      .then(() => {
        VK.Widgets.Auth('vk_comments', {

          onAuth:(userInfo)=>{
          debugger;
          console.log(userInfo)
          VK.api("groups.isMember", {
              group_id:203848473,
              user_id:userInfo.uid,
              "v":"5.73"
            }, function (data) {
            console.log(data)
          });
        }});
        // VK.Widgets.CommunityMessages("vk_comments", 203848473, {expanded: "1",tooltipButtonText: "Есть вопрос?"});
        // VK.Widgets.Comments("vk_comments", { limit: 5, attach: "*" });
      });
  }
};
</script>
