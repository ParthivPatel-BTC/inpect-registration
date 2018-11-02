class UserRegistration < ActiveRecord::Base
  enum state: { sign_up: 0, email_verification: 1, login: 2 } do
    event :verify_email do
      transition :sign_up => :email_verification
    end

    event :login_user do
      transition :email_verification => :login
    end
  end

  # enum response_state: { signed_up: 0, login: 1 } do
  #   event :signed_up do
  #     transition :signed_up => :login
  #   end

  #   event :login_user do
  #     transition :email_verification => :login
  #   end
  # end
end
