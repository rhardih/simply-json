require 'rubygems'
require 'sinatra'
require 'net/https'

get '/' do
  uri = URI(URI.encode(params[:uri]))
  https_session = Net::HTTP.new(uri.host, uri.port)
  https_session.use_ssl = true if uri.port == 443
  https_session.start
  response = https_session.get(uri.path + "?" + uri.query)
  response.body
end
