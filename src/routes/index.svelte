<script>
  const token = new URLSearchParams(window.location.search).get("oauth_token");

  function login() {
    fetch("/login")
      .then(res => res.text())
      .then(form => form.match(/oauth_token=([\w-]+)/)[1])
      .then(token => window.location = `https://api.twitter.com/oauth/authenticate?oauth_token=${token}`)
  }
</script>

<svelte:head>
	<title>Find Tweets</title>
</svelte:head>

<h1>Token: {token}</h1>
<button on:click={login}>Login</button>
