require 'fileutils'

task :default => ['jsmocka:test']

namespace :jsmocka do

  NAME = 'js-mocka'
  BASE_DIR = File.expand_path(File.dirname(__FILE__))
  SUPPORT_DIR = File.join(BASE_DIR, 'support')
  JS_DOC_DIR = File.join(SUPPORT_DIR, 'jsdoc-toolkit')
  BUILD_DIR = File.join(BASE_DIR, 'build')
  DIST_FILE = File.join(BUILD_DIR, "#{NAME}.js")
  DIST_FILE_PACKED = File.join(BUILD_DIR, "#{NAME}-minified.js")
  DOC_DIR = File.join(BUILD_DIR, 'doc')
  SPEC_DIR = File.join(BASE_DIR, 'spec')
  SRC_FILES = %w(
    js-mocka
    base
    configuration
    matcher
    expectation
    integration
  ).map{ |file| File.join(BASE_DIR, 'src', "#{file}.js") }

  desc 'Performs the build'
  task :build => ['jsmocka:test', 'jsmocka:doc', 'jsmocka:compress'] do
    STDOUT.puts 'Build complete.'
  end

  desc 'Generates files for distribution'
  task :dist => ['jsmocka:build'] do

  end

  desc "Remove build files and directories"
  task :clean do
    execute("Delete #{BUILD_DIR}.") { FileUtils.rm_rf(BUILD_DIR) }
  end

  desc "Concatenate all src files into a single file"
  task :concatenate do
    execute("Create dir #{BUILD_DIR}") { FileUtils.mkdir_p(BUILD_DIR) }
    execute("Create #{DIST_FILE}.") do
      File.open(DIST_FILE, 'w') do |dist|
        SRC_FILES.each do |file|
          execute("Append #{file} to #{DIST_FILE}") { dist.write File.read(file) }
        end
      end
    end
  end

  desc 'Remove all comments and whitespace and compress'
  task :compress => ['jsmocka:concatenate'] do
    execute("Compress #{DIST_FILE} to #{DIST_FILE_PACKED}.") do
      java(File.join(SUPPORT_DIR, 'yuicompressor.jar'), '-o', DIST_FILE_PACKED, DIST_FILE)
    end
  end

  desc 'Run the test suite using Rhino'
  task :test => ['jsmocka:concatenate'] do
    Dir.chdir(SPEC_DIR) do
      execute("Running specs") do
        java File.join(SUPPORT_DIR, 'js.jar'), File.join(SPEC_DIR, 'runner.js')
      end
    end
  end

  desc 'Generate API documentation'
  task :doc => ['jsmocka:concatenate'] do
    execute('Creating API docs') do
      java  File.join(JS_DOC_DIR, 'jsrun.jar'),
            File.join(JS_DOC_DIR, 'app', 'run.js'),
            '-a',
            "-t=#{File.join(JS_DOC_DIR, 'templates', 'jsdoc')}",
            "-d=#{DOC_DIR}",
            DIST_FILE
    end
  end

private

  def java(*commands)
    system('java', '-jar', *commands)
  end

  def execute(msg)
    STDOUT.puts msg
    yield if block_given?
  end

end

