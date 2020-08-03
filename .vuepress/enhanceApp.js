export default ({ router }) => {
    router.addRoutes(
      [
        {
          path: '/chat',
          redirect: to => {
            window.location.href = 'https://discord.gg/cPjEnPd'
            return '/redirecting' // not important since redirecting
          } 
        }
      ]
    )
 }