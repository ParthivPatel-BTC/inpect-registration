class CreateUserRegistrations < ActiveRecord::Migration
  def change
    create_table :user_registrations do |t|
      t.json :request_data
      t.json :response_data
      t.integer :state, default: 0
      t.integer :response_state, default: 0
      t.string :email

      t.timestamps null: false
    end
  end
end
