<script>
  const token = new URLSearchParams(window.location.search).get("oauth_token");
  let data = {};

  function login() {
    window.location = "/login";
  }

  function getDms() {
    fetch("/api/direct_messages/events/list.json", { headers: { Authorization: token }})
      .then(response => response.json())
      .then(json => data = json)
  }
</script>

<svelte:head>
	<title>Find Tweets</title>
</svelte:head>

<h1>Token: {token}</h1>
<button on:click={login}>Login</button>
<button on:click={getDms}>Get DMs</button>
<pre><code>{JSON.stringify(data, null, 4)}</code></pre>
