class PushDataToServerWorker
  include Sidekiq::Worker

  def perform(user_id)
    user_registration = UserRegistration.find(user_id)
    request_data = user_registration.request_data

    system "casperjs --engine=slimerjs --debug=true 1_healthcare_gov_create_account.js --state=#{request_data['state']} --firstName=#{request_data['first_name']} --lastName=#{request_data['last_name']} --email=#{request_data['email']}  --password=#{request_data['password']} --confirmPassword=#{request_data['confirm_password']}  --q1=0 --q2=1 --q3=2 --a1=#{request_data['securityQuestions']['0']} --a2=#{request_data['securityQuestions']['1']} --a3=#{request_data['securityQuestions']['2']}"

    json_response = File.read("#{Rails.root}/registration_form_fields.json")
    parsed_response = JSON.parse(json_response)['response']

    if user_registration.update(response_data: parsed_response)
      if user_registration.response_data['success'] == true
        user_registration.verify_email
        message = user_registration.response_data['label']
      else
        message = 'Something went wrong. Please contact to Admin'
      end
    end
  end
end
