package controllers

import java.util.UUID
import javax.inject.Inject

import com.mohiva.play.silhouette.api._
import com.mohiva.play.silhouette.api.services.{AuthInfoService, AvatarService}
import com.mohiva.play.silhouette.api.util.PasswordHasher
import com.mohiva.play.silhouette.impl.authenticators.SessionAuthenticator
import com.mohiva.play.silhouette.impl.providers._
import controllers.headers.ProvidesHeader
import forms.SignUpForm
import models.User
import models.daos.slick.UserDAOSlick
import models.services.UserService
import play.api.i18n.Messages
import play.api.libs.concurrent.Execution.Implicits._
import play.api.mvc.Action

import scala.concurrent.Future

/**
 * The sign up controller.
 *
 * @param env The Silhouette environment.
 * @param userService The user service implementation.
 * @param authInfoService The auth info service implementation.
 * @param avatarService The avatar service implementation.
 * @param passwordHasher The password hasher implementation.
 */
class SignUpController @Inject() (
                                   implicit val env: Environment[User, SessionAuthenticator],
                                   val userService: UserService,
                                   val authInfoService: AuthInfoService,
                                   val avatarService: AvatarService,
                                   val passwordHasher: PasswordHasher)
  extends Silhouette[User, SessionAuthenticator] with ProvidesHeader  {

  /**
   * Registers a new user.
   *
   * @return The result to display.
   */
  def signUp = Action.async { implicit request =>
    SignUpForm.form.bindFromRequest.fold (
      form => Future.successful(BadRequest(views.html.signUp(form))),
      data => {
        val loginInfo = LoginInfo(CredentialsProvider.ID, data.email)
        userService.retrieve(loginInfo).flatMap {
          case Some(user) =>
            Future.successful(Redirect(routes.UserController.signUp()).flashing("error" -> Messages("user.exists")))
          case None =>
            val authInfo = passwordHasher.hash(data.password)
            val user = User(
              userId = UUID.randomUUID(),
              loginInfo = loginInfo,
              username = data.username,
              email = data.email
            )
            for {
              user <- userService.save(user)
              authInfo <- authInfoService.save(loginInfo, authInfo)
              authenticator <- env.authenticatorService.create(user.loginInfo)
              value <- env.authenticatorService.init(authenticator)
              result <- env.authenticatorService.embed(value, Future.successful(
                Redirect(routes.ApplicationController.index)
              ))
            } yield {
              env.eventBus.publish(SignUpEvent(user, request, request2lang))
              env.eventBus.publish(LoginEvent(user, request, request2lang))
              result
            }
        }
      }
    )
  }
}
