# Deploy target config. SshKeyPath: use $null for password login.
# RemotePath must match nginx alias (e.g. blog-admin / blog-front).
return @{
  Server = @{
    Host       = "8.163.46.202"
    User       = "root"
    Port       = 22
    SshKeyPath = (Join-Path $env:USERPROFILE '.ssh\id_rsa')
  }

  Backends = @(
    @{
      Name        = "blog-server"
      LocalPath   = "blog-server"
      RemotePath  = "/home/blog-server"
      ProcessName = "blog-server"
      StartScript = "start"
    },
    @{
      Name               = "blog-ai-server"
      LocalPath          = "blog-ai-server"
      RemotePath         = "/home/blog-ai-server"
      ProcessName        = "blog-ai-server"
      StartScript        = "start"
      PostDeployCommands = @("npm run sql:ai-lab")
    }
  )

  Frontends = @(
    @{
      Name       = "blog-admin"
      LocalPath  = "blog-admin"
      RemotePath = "/usr/share/nginx/html/blog-admin"
    },
    @{
      Name       = "blog-front"
      LocalPath  = "blog-front"
      RemotePath = "/usr/share/nginx/html/blog-front"
    },
    @{
      Name       = "blog-ai"
      LocalPath  = "blog-ai"
      RemotePath = "/usr/share/nginx/html/blog-ai"
    },
    @{
      Name       = "blog-ai-admin"
      LocalPath  = "blog-ai-admin"
      RemotePath = "/usr/share/nginx/html/blog-ai-admin"
    }
  )
}
