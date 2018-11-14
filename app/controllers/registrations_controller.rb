class RegistrationsController < ApplicationController


  def index
  end

  def new
    @user_registration = UserRegistration.new
  end

  def create
    user_registration = UserRegistration.new(user_params)
    user_registration[:request_data] = params[:registration]
    user_registration[:email] = params[:registration][:email]
    if user_registration.save
      render :nothing => true, :status => 200, :content_type => 'text/html'
      processed_data = PushDataToServerWorker.perform_async(user_registration.id)
    else
      flash[:alert] = 'Something went wrong'
      render :new
    end
  end

  private

  def user_params
    params.require(:registration).permit(:request_data, :email, :response_data)
  end
end