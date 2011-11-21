require 'rubygems'
require 'sinatra'
require 'net/https'

get '/' do
  uri = URI.parse(params[:uri])
  http_session = Net::HTTP.new(uri.host, uri.port)
  http_session.use_ssl = true if uri.port == 443
  http_session.start
  response = http_session.get(uri.path)
  response.body
end
