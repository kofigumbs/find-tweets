<script>
  const token = new URLSearchParams(window.location.search).get("oauth_token");
  let data = {};

  function login() {
    fetch("/login")
      .then(res => res.text())
      .then(form => form.match(/oauth_token=([\w-]+)/)[1])
      .then(token => window.location = `https://api.twitter.com/oauth/authenticate?oauth_token=${token}`)
  }

  function getDms() {
    fetch("/api/direct_messages/events/list.json", {
      headers: { Authorization: token },
    })
      .then(res => res.json())
      .then(data => data = data)
  }
</script>

<svelte:head>
	<title>Find Tweets</title>
</svelte:head>

<h1>Token: {token}</h1>
<button on:click={login}>Login</button>
<button on:click={getDms}>Get DMs</button>
<pre><code>{JSON.stringify(data, 4)}</code></pre>
