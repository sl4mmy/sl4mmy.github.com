namespace :site do
  desc "Removes generated content"
  task :clean do
    rm_rf "_site/"
  end

  desc "Generates site"
  task :generate do
    system "jekyll"
  end

  desc "Opens generated site in new browser tab"
  task :preview do
    t = Thread.new {
      Rake::Task["server:start"].execute
    }

    system("open http://localhost:4000/")

    trap("INT") { t.kill }
    t.join
  end
end

namespace :server do
  desc "Starts server with generated site"
  task :start do
    require 'webrick'
    include WEBrick

    mime_types = WEBrick::HTTPUtils::DefaultMimeTypes
    mime_types.store 'js', 'application/javascript'

    s = HTTPServer.new(
      :Port => 4000,
      :MimeTypes => mime_types
    )
    s.mount("/", HTTPServlet::FileHandler, "_site/")
    t = Thread.new {
      s.start
    }

    trap("INT") { s.shutdown }
    t.join()
  end
end

task :default => :"site:generate"
