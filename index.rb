require 'rubygems'
require 'sinatra'
require 'net/https'

get '/' do
  uri = URI(URI.encode(params[:uri]))
  https_session = Net::HTTP.new(uri.host, uri.port)
  https_session.use_ssl = true if uri.port == 443
  https_session.start
  # uri.query can be nil and cause an exception
  response = https_session.get(uri.path + "?" + uri.query.to_s) # to_s in case nil
  response.body
end
